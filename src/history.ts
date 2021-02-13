export class History {
    protected commands: string[] = [];
    protected index = 0;

    get length(): number {
        return this.commands.length;
    }

    get current(): string | undefined {
        return this.commands[this.commands.length - this.index];
    }

    get mostRecent(): string | undefined {
        return this.commands[this.commands.length - 1];
    }

    constructor(protected maxLength: number) {}

    push(command: string): void {
        this.index = 0;
        if (command === "" || command === this.mostRecent) {
            return;
        }

        this.commands.push(command);
        if (this.commands.length > this.maxLength) {
            this.commands.shift();
        }
    }

    prev(): string | undefined {
        if (this.index === this.commands.length) {
            return;
        }

        this.index += 1;
        return this.current;
    }

    next(): string | undefined {
        if (this.index === 0) {
            return;
        }

        this.index -= 1;
        return this.current;
    }
}
