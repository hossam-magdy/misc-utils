import { CallbackCollection } from "./CallbackCollection.ts";
import {
  assertSpyCall,
  assertSpyCalls,
} from "https://deno.land/x/mock@v0.10.0/asserts.ts";
import { assertEquals } from "https://deno.land/std@0.117.0/testing/asserts.ts";
import { spy } from "https://deno.land/x/mock@v0.10.0/spy.ts";

Deno.test("Adds callbacks via .add, and invokes them via .invoke", async () => {
  const collection = new CallbackCollection<string>();

  const listenerA = spy();
  collection.add(listenerA);
  assertEquals(collection.size, 1);

  await collection.invoke("abc"); // can be from any event like: window.addEventListener('focus', () => collection.invoke('abc'))
  assertSpyCall(listenerA, 0, { args: ["abc"] });
  assertSpyCalls(listenerA, 1);
});

Deno.test("Invokes the callbacks considering the onlyOnce option", async () => {
  const collection = new CallbackCollection<string>();

  const listenerA = spy();
  collection.add(listenerA, { onlyOnce: true });
  assertEquals(collection.size, 1);

  await collection.invoke("abc"); // can be from any event like: window.addEventListener('focus', () => collection.invoke('abc'))

  assertSpyCall(listenerA, 0, { args: ["abc"] });
  assertSpyCalls(listenerA, 1);
  assertEquals(collection.size, 0); // the only-once callback should be removed

  await collection.invoke("abc"); // if the same event happens again, the only-once callbacks should NOT be invoked
  await collection.invoke("abc");
  assertSpyCalls(listenerA, 1);
});

Deno.test("Deletes the callback from the collection", async () => {
  const collection = new CallbackCollection<string>();

  const listenerA = spy();
  const listenerB = spy();
  collection.add(listenerA);
  collection.add(listenerB);
  assertEquals(collection.size, 2);
  collection.delete(listenerB);
  assertEquals(collection.size, 1);

  await collection.invoke("abc");
  assertSpyCalls(listenerA, 1);
  assertSpyCalls(listenerB, 0);
});

Deno.test("Clears the collecion", async () => {
  const collection = new CallbackCollection<string>();

  const listenerA = spy();
  const listenerB = spy();
  collection.add(listenerA, { onlyOnce: true });
  collection.add(listenerB, { onlyOnce: true });
  collection.clear();
  assertEquals(collection.size, 0);

  await collection.invoke("abc");
  assertSpyCalls(listenerA, 0);
  assertSpyCalls(listenerB, 0);
});

Deno.test('Invokes the callbacks with the "self/this" object', async () => {
  const listenerA = spy();
  const self = { testVal: "myTestVal" };

  const collection = new CallbackCollection<string>();

  collection.add(listenerA, { onlyOnce: true });
  await collection.invoke("abc", self);

  assertSpyCall(listenerA, 0, { args: ["abc"], self });
});

Deno.test(
  'Invokes the callbacks, multiple calls considering the "onlyOnce" option and "self/this"',
  async () => {
    const collection = new CallbackCollection<string>();

    const listenerA = spy();
    collection.add(listenerA, { onlyOnce: true });

    const listenerB = spy();
    collection.add(listenerB);

    assertEquals(collection.size, 2);

    await collection.invoke("abc");
    assertEquals(collection.size, 1);
    assertSpyCall(listenerA, 0, { args: ["abc"] });
    assertSpyCall(listenerB, 0, { args: ["abc"] });

    const listenerC = spy();
    collection.addOnlyOnce(listenerC);
    assertEquals(collection.size, 2);

    await collection.invoke("def");
    assertSpyCall(listenerB, 1, { args: ["def"] });
    assertSpyCall(listenerC, 0, { args: ["def"] });

    await collection.invoke("ghi");
    assertSpyCall(listenerB, 2, { args: ["ghi"] });

    assertSpyCalls(listenerA, 1);
    assertSpyCalls(listenerB, 3);
    assertSpyCalls(listenerC, 1);
  },
);
