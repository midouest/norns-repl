import { History } from "./history";
import { deleteAt, insertAt } from "./util";

export interface InputBufferOptions {
    prefix: string;
    maxHistory: number;
}

export interface CommandResponse {
    output: string;
    command: string;
}

export type WriteResponse = CommandResponse | string | undefined;

export class InputBuffer {
    protected cursor = 0;
    protected buffer = "";
    protected prevBuffer?: string;
    protected history: History;

    get contents(): string {
        return this.buffer;
    }

    get cursorPos(): number {
        return this.cursor;
    }

    constructor(protected options: InputBufferOptions) {
        this.history = new History(this.options.maxHistory);
    }

    handle(data: string): WriteResponse {
        if (data === Key.backspace) {
            return this.handleBackspace();
        }

        if (data === Key.up) {
            const command = this.history.prev();
            return this.handleHistory(command);
        }

        if (data === Key.down) {
            const command = this.history.next();
            return this.handleHistory(command ?? "");
        }

        if (data === Key.left && this.cursor > 0) {
            this.cursor -= 1;
            return data;
        }

        if (data === Key.right && this.cursor < this.buffer.length) {
            this.cursor += 1;
            return data;
        }

        if (data === Key.return) {
            return this.handleReturn();
        }

        if (data.charCodeAt(0) < 32) {
            return;
        }

        this.buffer = insertAt(this.buffer, this.cursor, data);
        let output = this.buffer.slice(this.cursor);
        if (output.length !== data.length) {
            output += cursorBack(output.length - data.length);
        }
        this.cursor += data.length;
        return output;
    }

    prompt(): string {
        return (
            Action.clearLine + Key.return + this.options.prefix + this.buffer
        );
    }

    protected handleBackspace(): string | undefined {
        if (this.buffer.length === 0 || this.cursor === 0) {
            return;
        }

        this.cursor--;
        this.buffer = deleteAt(this.buffer, this.cursor);
        return Action.deleteChar;
    }

    protected handleHistory(command?: string): string | undefined {
        if (command === undefined) {
            return;
        }

        this.buffer = command;
        this.cursor = this.buffer.length;
        return this.prompt();
    }

    protected handleReturn(): CommandResponse | undefined {
        const command = this.buffer;
        if (this.buffer !== "") {
            this.history.push(command);
        }

        this.buffer = "";
        this.cursor = 0;
        const output = Action.newLine;

        return {
            output,
            command,
        };
    }
}

export function cursorBack(n: number): string {
    return `\x1b[${n}D`;
}

export enum Key {
    backspace = "\x7f",
    return = "\r",
    up = "\x1b[A",
    down = "\x1b[B",
    right = "\x1b[C",
    left = "\x1b[D",
}

export enum Action {
    deleteChar = "\x1b[D\x1b[P",
    clearLine = "\x1b[2K",
    newLine = "\r\n",
}
