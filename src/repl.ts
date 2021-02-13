import * as vscode from "vscode";
import WebSocket = require("ws");

import { InputBuffer } from "./input";
import { info, debounce, capitalize } from "./util";

export interface NornsREPLOptions {
    webSocket: WebSocket;
    maxHistory: number;
    promptDebounce: number;
    name: string;
    terminator: string;
}

export class NornsREPL implements vscode.Pseudoterminal {
    protected input = new InputBuffer({
        prefix: "> ",
        maxHistory: this.options.maxHistory,
    });

    protected writeEmitter = new vscode.EventEmitter<string>();

    readonly onDidWrite = this.writeEmitter.event;

    constructor(protected options: NornsREPLOptions) {
        const writePromptDebounce = debounce(
            () => this.writePrompt(),
            this.options.promptDebounce
        );

        const re = /\n/g;
        this.options.webSocket.on("message", (data) => {
            const text = data.toString().replace(re, "\r\n");
            this.writeEmitter.fire(text);
            writePromptDebounce();
        });
    }

    open(): void {
        info("repl open");
        const name = capitalize(this.options.name);
        this.writeEmitter.fire(`Connected to ${name}!\n`);
        this.writePrompt();
    }

    close(): void {
        info("repl close");
        this.options.webSocket.close();
    }

    handleInput(data: string): void {
        const response = this.input.handle(data);
        if (!response) {
            return;
        }

        if (typeof response === "string") {
            this.writeEmitter.fire(response);
            return;
        }

        this.writeEmitter.fire(response.output);
        this.options.webSocket.send(response.command + this.options.terminator);
    }

    protected writePrompt(): void {
        const data = this.input.prompt();
        this.writeEmitter.fire(data);
    }
}
