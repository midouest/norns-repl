import * as assert from "assert";
import {
    Action,
    cursorBack,
    InputBuffer,
    Key,
    WriteResponse,
} from "../../input";

suite("InputBuffer", () => {
    let input: InputBuffer;

    function testInput(title: string, steps: Step | Step[]): void {
        test(title, () => {
            if (!Array.isArray(steps)) {
                runStep(steps, 0, input);
                return;
            }

            steps.forEach((step, index) => {
                runStep(step, index, input);
            });
        });
    }

    setup(() => {
        input = new InputBuffer({
            maxHistory: 10,
            prefix: ">",
        });
    });

    testInput("appends new data to the output", {
        data: "foo",
        response: "foo",
        contents: "foo",
        cursorPos: 3,
    });

    testInput("deletes data from the output", [
        "foo",
        {
            data: Key.backspace,
            response: Action.deleteChar,
            contents: "fo",
            cursorPos: 2,
        },
    ]);

    testInput("does not delete when the buffer is empty", {
        data: Key.backspace,
        response: undefined,
        contents: "",
        cursorPos: 0,
    });

    testInput("moves the cursor left", [
        "foo",
        {
            data: Key.left,
            response: Key.left,
            contents: "foo",
            cursorPos: 2,
        },
    ]);

    testInput("does not move the cursor beyond the leftmost position", {
        data: Key.left,
        cursorPos: 0,
    });

    testInput("moves the cursor right", [
        "foo",
        Key.left,
        {
            data: Key.right,
            response: Key.right,
            contents: "foo",
            cursorPos: 3,
        },
    ]);

    testInput("does not move the cursor beyond the rightmost position", {
        data: Key.right,
        response: undefined,
        cursorPos: 0,
    });

    testInput("inserts characters at the cursor", [
        "foo",
        Key.left,
        {
            data: "bar",
            contents: "fobaro",
            cursorPos: 5,
        },
    ]);

    testInput("deletes characters at the cursor", [
        "bar",
        Key.left,
        {
            data: Key.backspace,
            response: Action.deleteChar,
            contents: "br",
            cursorPos: 1,
        },
    ]);

    testInput("does not delete beyond the leftmost position", [
        "z",
        Key.left,
        {
            data: Key.backspace,
            response: undefined,
            contents: "z",
            cursorPos: 0,
        },
    ]);

    test("ignores unhandled control codes", () => {
        Array.from({ length: 32 })
            .map((_, i) => String.fromCharCode(i))
            .filter((k) => k !== Key.return)
            .forEach((data) =>
                assert.strictEqual(input.handle(data), undefined)
            );
    });

    testInput("returns commands when enter is pressed", [
        "foo",
        {
            data: Key.return,
            response: {
                command: "foo",
                output: Action.newLine,
            },
            contents: "",
            cursorPos: 0,
        },
    ]);

    testInput("restores previously entered commands", [
        "foo",
        Key.return,
        {
            data: Key.up,
            response: Action.clearLine + Key.return + ">foo",
            contents: "foo",
            cursorPos: 3,
        },
    ]);

    testInput("does not restore empty commands", [
        "",
        Key.return,
        "foo",
        {
            data: Key.up,
            response: undefined,
            contents: "foo",
            cursorPos: 3,
        },
    ]);

    testInput("navigates back and forth in history", [
        "foo",
        Key.return,
        "bar",
        Key.return,
        Key.up,
        Key.up,
        {
            data: Key.down,
            response: Action.clearLine + Key.return + ">bar",
            contents: "bar",
            cursorPos: 3,
        },
    ]);

    testInput("inserts text in the middle of a buffer", [
        "foo",
        Key.left,
        {
            data: "bar",
            response: "baro" + cursorBack(1),
            contents: "fobaro",
            cursorPos: 5,
        },
    ]);
});

interface StepSpec {
    data: string;
    response?: WriteResponse;
    contents?: string;
    cursorPos?: number;
}

type Step = string | StepSpec;

function runStep(step: Step, index: number, input: InputBuffer): void {
    if (typeof step === "string") {
        input.handle(step);
        return;
    }

    const response = input.handle(step.data);

    if (step.hasOwnProperty("response")) {
        const message = formatMessage(index, "response");
        assert.deepStrictEqual(response, step.response, message);
    }

    if (step.contents !== undefined) {
        const message = formatMessage(index, "contents");
        assert.strictEqual(input.contents, step.contents, message);
    }

    if (step.cursorPos !== undefined) {
        const message = formatMessage(index, "cursorPos");
        assert.strictEqual(input.cursorPos, step.cursorPos, message);
    }
}

function formatMessage(index: number, property: string): string {
    return `Unexpected ${property} at step ${index + 1}`;
}
