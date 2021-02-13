import * as vscode from 'vscode';
import WebSocket = require('ws');

import { info, debounce } from './util';

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
    protected history: string[] = [];
    protected historyIdx = 0;

    readonly onDidWrite = this.writeEmitter.event;

    constructor(protected ws: WebSocket) {
        const re = /\n/g;

        const writePromptDebounce = debounce(() => this.writePrompt(), 100);

        this.ws.on('message', (data) => {
            const text = data.toString().replace(re, '\r\n');
            this.writeEmitter.fire(text);
            writePromptDebounce();
        });
    }

    open(): void {
        info('repl open');
        this.writeEmitter.fire('Connected to Matron!\r\n');
        this.writePrompt();
    }

    close(): void {
        info('repl close');
        this.ws.close();
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
            this.ws.send(this.buffer + '\r');
            this.buffer = '';
            return;
        }

        this.buffer += data;
        this.writeEmitter.fire(data);
    }
}

