import test from "node:test";
import assert from "node:assert/strict";
import { createListRequests } from "../src/services/listRequests.js";
const deferred = () => {
  let resolve;
  const promise = new Promise((done) => { resolve = done; });
  return { promise, resolve };
};
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

test("a slow list response cannot replace the new selection", async () => {
  const requests = createListRequests();
  const slow = deferred();
  const results = [];
  requests.select(1);
  requests.load(1, () => slow.promise, (value) => results.push(value), assert.fail);
  requests.select(2);
  requests.load(2, async () => "second", (value) => results.push(value), assert.fail);
  await tick();
  slow.resolve("first");
  await tick();
  assert.deepEqual(results, ["second"]);
});

test("writes run sequentially and a failure does not block later saves", async () => {
  const requests = createListRequests();
  requests.select(1);
  const slow = deferred();
  const events = [];
  const first = requests.mutate(1, () => { events.push("start"); return slow.promise; }, (value) => events.push(value));
  const second = requests.mutate(1, async () => "second", (value) => events.push(value));
  await tick();
  assert.deepEqual(events, ["start"]);
  slow.resolve("first");
  await Promise.all([first, second]);
  assert.deepEqual(events, ["start", "first", "second"]);
  await assert.rejects(requests.mutate(1, async () => { throw new Error("offline"); }, assert.fail));
  await requests.mutate(1, async () => "retry", (value) => events.push(value));
  assert.equal(events.at(-1), "retry");
});

test("repeated selection preserves a pending load; cancelled loads never publish", async () => {
  const requests = createListRequests();
  requests.select(1);
  const results = [];
  requests.load(1, async () => "loaded", (value) => results.push(value), assert.fail);
  assert.equal(requests.select(1), false);
  await tick();
  const cancel = requests.load(1, async () => "cancelled", (value) => results.push(value), assert.fail);
  cancel();
  await tick();
  assert.deepEqual(results, ["loaded"]);
});

test("a pending save for another list never replaces the current list", async () => {
  const requests = createListRequests();
  const slow = deferred();
  const results = [];
  requests.select(1);
  const pending = requests.mutate(1, () => slow.promise, (value) => results.push(value));
  await tick();
  requests.select(2);
  requests.load(2, async () => "second", (value) => results.push(value), assert.fail);
  slow.resolve("first");
  await pending;
  await tick();
  assert.deepEqual(results, ["second"]);
});
