import * as vscode from 'vscode';
import WebSocket = require('ws');

import { InputBuffer } from './input';
import { info, debounce } from './util';

export class NornsREPL implements vscode.Pseudoterminal {
    protected input = new InputBuffer({
        prefix: '> ',
        maxHistory: 100,
    });

    protected writeEmitter = new vscode.EventEmitter<string>();

    readonly onDidWrite = this.writeEmitter.event;

    constructor(protected ws: WebSocket, protected maxHistory: number) {
        const writePromptDebounce = debounce(() => this.writePrompt(), 100);

        const re = /\n/g;
        this.ws.on('message', (data) => {
            const text = data.toString().replace(re, '\r\n');
            this.writeEmitter.fire(text);
            writePromptDebounce();
        });
    }

    open(): void {
        info('repl open');
        this.writePrompt();
    }

    close(): void {
        info('repl close');
        this.ws.close();
    }

    handleInput(data: string): void {
        const response = this.input.handle(data);
        if (!response) {
            return;
        }

        if (typeof response === 'string') {
            this.writeEmitter.fire(response);
            return;
        }

        this.writeEmitter.fire(response.output);
        this.ws.send(response.command + '\r');
    }

    protected writePrompt(): void {
        const data = this.input.prompt();
        this.writeEmitter.fire(data);
    }
}

