import { Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import * as vscode from 'vscode';

import { info } from './log';

enum Keys {
    enter = '\r',
    backspace = '\x7f',
    up = '\x1b[A',
    down = '\x1b[B',
}

enum Actions {
    cursorBack = "\x1b[D",
    deleteChar = "\x1b[P",
    clearLine = "\x1b[2K",
}

export class NornsREPL implements vscode.Pseudoterminal {
    protected writeEmitter = new vscode.EventEmitter<string>();
    protected buffer = '';
    protected closeSource = new Subject<void>();
    protected close$ = this.closeSource.asObservable();
    protected txSource = new Subject<string>();
    protected history: string[] = [];
    protected historyIdx = 0;

    readonly onDidWrite = this.writeEmitter.event;
    readonly tx$ = this.txSource.asObservable();

    constructor(protected rx$: Observable<string>) {
        const re = /\n/g;

        rx$.pipe(takeUntil(this.close$)).subscribe((data) => {
            const text = data.replace(re, '\r\n');
            this.writeEmitter.fire(text);
        });

        rx$.pipe(debounceTime(100), takeUntil(this.close$)).subscribe(() => {
            this.writePrompt();
        });
    }

    open(_initialDimensions?: vscode.TerminalDimensions): void {
        info('repl open');
        this.writeEmitter.fire('Connected to Matron!\r\n');
        this.writePrompt();
    }

    close(): void {
        info('repl close');
        this.closeSource.next();
        this.closeSource.complete();
        this.txSource.complete();
    }

    handleInput(data: string): void {
        if (data === Keys.backspace) {
            this.handleBackspace();
            return;
        }

        // ignore control codes
        if (data.length > 1) {
            if (data === Keys.up) {
                this.historyUp();
            } else if (data === Keys.down) {
                this.historyDown();
            }
            return;
        }

        this.handleChar(data);
    }

    protected writePrompt(): void {
        this.writeEmitter.fire(Actions.clearLine);
        this.writeEmitter.fire(`\r> ${this.buffer}`);
    }

    protected handleBackspace(): void {
        if (this.buffer.length === 0) {
            return;
        }

        this.buffer = this.buffer.substr(0, this.buffer.length - 1);
        this.writeEmitter.fire(Actions.cursorBack);
        this.writeEmitter.fire(Actions.deleteChar);
    }

    protected historyUp(): void {
        if (this.historyIdx === this.history.length) {
            return;
        }
        this.historyIdx++;
        this.restoreHistory();
    }

    protected historyDown(): void {
        if (this.historyIdx === 0) {
            this.buffer = '';
            this.writePrompt();
            return;
        }
        this.historyIdx--;
        this.restoreHistory();
    }

    protected restoreHistory(): void {
        this.buffer = this.history[this.history.length - this.historyIdx];
        this.writePrompt();
    }

    protected handleChar(data: string): void {
        if (data === Keys.enter) {
            if (this.buffer === '') {
                return;
            }

            this.history.push(this.buffer);
            this.historyIdx = 0;

            this.writeEmitter.fire('\r\n');
            this.txSource.next(this.buffer + '\r');
            this.buffer = '';
            return;
        }

        this.buffer += data;
        this.writeEmitter.fire(data);
    }
}

