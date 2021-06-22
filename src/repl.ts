import * as vscode from "vscode";
import WebSocket = require("ws");
import { API } from "./api";

import { InputBuffer } from "./input";
import { info, debounce } from "./util";

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
        this.setContextIsActive(true);

        const writePromptDebounce = debounce(
            () => this.writePrompt(),
            this.options.promptDebounce
        );

        this.options.webSocket.on("close", () => {
            this.setContextIsActive(false);
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
        this.writeEmitter.fire(`connected to ${this.options.name}!\n`);
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
            this.writeEmitter.fire(response.output);
            this.writeEmitter.fire("starting...\r\n");
            this.install(components[1]);
            return;
        }

        this.writeEmitter.fire(response.output);
        this.do(response.command.slice(1));
    }

    protected writePrompt(): void {
        const data = this.input.prompt();
        this.writeEmitter.fire(data);
    }

    protected async install(url: string): Promise<void> {
        const response = await this.options.api.installProjectFromURL(url);

        const output = response.error
            ? `install failed: ${response.error}\r\n`
            : `installed "${response.catalog_entry.project_name}"!\r\n`;

        this.writeEmitter.fire(output);
        this.writePrompt();
    }

    protected async do(operation: string): Promise<void> {
        await this.options.api.doUnitOperation(this.options.unit, operation);
        // todo: response
    }

    protected setContextIsActive(isActive: boolean): void {
        info(`repl ${this.options.name}.isActive: ${isActive}`);
        vscode.commands.executeCommand(
            "setContext",
            `nornsREPL:${this.options.name}.isActive`,
            isActive
        );
    }
}
