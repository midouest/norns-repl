import * as assert from "assert";
import { History } from "../../history";

suite("History", () => {
    const maxHistory = 2;
    let history: History;

    setup(() => {
        history = new History(maxHistory);
    });

    test("ignores empty commands", () => {
        history.push("");
        assert.strictEqual(history.length, 0);
    });

    test("pushes commands onto the stack", () => {
        history.push("foo");
        assert.strictEqual(history.length, 1);
        assert.strictEqual(history.mostRecent, "foo");

        history.push("bar");
        assert.strictEqual(history.length, 2);
        assert.strictEqual(history.mostRecent, "bar");
    });

    test("ignores subsequent, duplicate commands", () => {
        history.push("foo");
        history.push("foo");
        assert.strictEqual(history.length, 1);
    });

    test("goes back in history", () => {
        history.push("foo");
        assert.strictEqual(history.prev(), "foo");
    });

    test("returns undefined if there are no older commands", () => {
        history.push("foo");
        history.prev();
        assert.strictEqual(history.prev(), undefined);
        assert.strictEqual(history.current, "foo");
    });

    test("resets the index when new commands are pushed", () => {
        history.push("foo");
        history.prev();
        history.push("bar");
        assert.strictEqual(history.prev(), "bar");
    });

    test("goes forwards in history", () => {
        history.push("foo");
        history.push("bar");
        history.prev();
        history.prev();
        assert.strictEqual(history.next(), "bar");
    });

    test("returns undefined if there are no more recent commands", () => {
        history.push("foo");
        history.prev();
        assert.strictEqual(history.next(), undefined);
    });

    test("drops the oldest command when the max is reached", () => {
        history.push("foo");
        history.push("bar");
        history.push("baz");
        assert.strictEqual(history.length, maxHistory);
        assert.strictEqual(history.prev(), "baz");
        assert.strictEqual(history.prev(), "bar");
    });
});
