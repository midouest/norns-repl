import { History } from "./history";
import { deleteAt, insertAt } from "./util";

export interface PromptOptions {
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
    protected history = new History(this.options.maxHistory);

    constructor(protected options: PromptOptions) {}

    handle(data: string): WriteResponse {
        if (data === BACKSPACE) {
            return this.handleBackspace();
        }

        if (data === UP) {
            const command = this.history.prev();
            return this.handleHistory(command);
        }

        if (data === DOWN) {
            const command = this.history.next();
            return this.handleHistory(command ?? "");
        }

        if (data === LEFT && this.cursor > 0) {
            this.cursor -= 1;
            return data;
        }

        if (data === RIGHT && this.cursor < this.buffer.length) {
            this.cursor += 1;
            return data;
        }

        if (data.length > 1 || (data !== RETURN && data.charCodeAt(0) < 32)) {
            return;
        }

        if (data === RETURN) {
            return this.handleReturn();
        }

        this.buffer = insertAt(this.buffer, this.cursor, data);
        let output = this.buffer.slice(this.cursor);
        if (output.length > 1) {
            output += cursorBack(output.length - 1);
        }
        this.cursor += 1;
        return output;
    }

    prompt(): string {
        return CLEAR_LINE + RETURN + this.options.prefix + this.buffer;
    }

    protected handleBackspace(): string | undefined {
        if (this.buffer.length === 0 || this.cursor === 0) {
            return;
        }

        this.cursor--;
        this.buffer = deleteAt(this.buffer, this.cursor);
        return CURSOR_BACK + DELETE_CHAR;
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
        const output = NEWLINE;

        return {
            output,
            command,
        };
    }
}

function cursorBack(n: number): string {
    return `\x1b[${n}D`;
}

const CURSOR_BACK = "\x1b[D";
const DELETE_CHAR = "\x1b[P";
const CLEAR_LINE = "\x1b[2K";
const RETURN = "\r";
const NEWLINE = RETURN + "\n";
const BACKSPACE = "\x7f";
const UP = "\x1b[A";
const DOWN = "\x1b[B";
const RIGHT = "\x1b[C";
const LEFT = "\x1b[D";
