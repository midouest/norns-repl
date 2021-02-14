import * as assert from "assert";
import * as sinon from "sinon";
import { debounce, deleteAt, insertAt } from "../../util";

suite("Utilities", () => {
    test("inserts a string at the given position", () => {
        assert.strictEqual(insertAt("foo", 0, "bar"), "barfoo");
        assert.strictEqual(insertAt("foo", 1, "bar"), "fbaroo");
        assert.strictEqual(insertAt("foo", 3, "bar"), "foobar");
        assert.strictEqual(insertAt("foo", 4, "bar"), "foobar");
    });

    test("deletes a character at the given position", () => {
        assert.strictEqual(deleteAt("bar", 0), "ar");
        assert.strictEqual(deleteAt("bar", 1), "br");
        assert.strictEqual(deleteAt("bar", 2), "ba");
        assert.strictEqual(deleteAt("bar", 3), "bar");
    });

    function timeout(ms: number): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }

    test("calls a debounced function after a period of inactivity", async () => {
        const spy = sinon.spy();
        const debounced = debounce(spy, 10);

        debounced();
        assert.strict(spy.notCalled);

        await timeout(1);
        assert.strict(spy.notCalled);
        debounced();
        assert.strict(spy.notCalled);

        await timeout(11);
        assert.strict(spy.called);
    });
});
