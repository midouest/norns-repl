import * as vscode from "vscode";
import WebSocket = require("ws");
import { API } from "./api";

import { InputBuffer } from "./input";
import { info, debounce, capitalize } from "./util";

export interface NornsREPLOptions {
    webSocket: WebSocket;
    api: API;
    maxHistory: number;
    promptDebounce: number;
    name: string;
    unit: string;
    terminator: string;
}

export class NornsREPL implements vscode.Pseudoterminal {
    protected input = new InputBuffer({
        prefix: "> ",
        maxHistory: this.options.maxHistory,
    });

    protected writeEmitter = new vscode.EventEmitter<string>();
    protected closeEmitter = new vscode.EventEmitter<void>();

    readonly onDidWrite = this.writeEmitter.event;
    readonly onDidClose = this.closeEmitter.event;

    constructor(protected options: NornsREPLOptions) {
        const writePromptDebounce = debounce(
            () => this.writePrompt(),
            this.options.promptDebounce
        );

        this.options.webSocket.on("close", () => {
            this.closeEmitter.fire();
        });

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

        if (response.command[0] !== ";") {
            this.writeEmitter.fire(response.output);
            const message = response.command + this.options.terminator;
            this.options.webSocket.send(message);
            return;
        }

        const components = response.command.split(" ");
        if (components[0] === ";install") {
            this.options.api
                .installProjectFromURL(components[1])
                .then((result) => {
                    info(result);
                });
        } else {
            const operation = response.command.slice(1);
            this.options.api
                .doUnitOperation(this.options.unit, operation)
                .then((result) => {
                    info(result);
                });
        }

        this.writeEmitter.fire(response.output);
    }

    protected writePrompt(): void {
        const data = this.input.prompt();
        this.writeEmitter.fire(data);
    }
}
