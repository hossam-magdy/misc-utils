import { CallbackCollection } from './CallbackCollection.ts';
import { assertEquals } from 'https://deno.land/std@0.117.0/testing/asserts.ts';
import {
  assertSpyCall,
  assertSpyCalls,
} from 'https://deno.land/x/mock@v0.10.0/asserts.ts';
import { spy } from 'https://deno.land/x/mock@v0.10.0/spy.ts';

Deno.test('Adds callbacks via .add, and invokes them via .invoke', () => {
  const collection = new CallbackCollection();

  const listenerA = spy();
  collection.add(listenerA);

  collection.invoke(999, 123); // could be at any event, i.e: window.addEventListener('focus', () => collection.invoke('abc'))
  assertSpyCall(listenerA, 0, { args: [999, 123] });
  assertSpyCalls(listenerA, 1);
});

Deno.test('Adds callbacks via constructor arg', () => {
  const listenerA = spy();
  const listenerB = spy();
  const collection = new CallbackCollection(listenerA);
  collection.add(listenerB);

  collection.invoke();
  assertSpyCalls(listenerA, 1);
  assertSpyCalls(listenerB, 1);
});

Deno.test(
  'Invokes the callbacks considering the onlyOnce flag / .addOnlyOnce',
  async () => {
    const collection = new CallbackCollection();

    const listenerA = spy();
    const listenerB = spy();
    collection.add(listenerA, { onlyOnce: true });
    collection.addOnlyOnce(listenerB); // syntactic sugar
    assertEquals(collection.size, 2);

    await collection.invoke('abc');
    assertEquals(collection.size, 0); // the only-once callback should be removed
    assertSpyCall(listenerA, 0, { args: ['abc'] });
    assertSpyCall(listenerB, 0, { args: ['abc'] });
    assertSpyCalls(listenerA, 1);
    assertSpyCalls(listenerB, 1);

    await collection.invoke('abc'); // if the same event happens again, the only-once callbacks should NOT be invoked again
    assertSpyCalls(listenerA, 1);
    assertSpyCalls(listenerB, 1);
  }
);

Deno.test(
  'If an only-once callback returns boolean false, it is not removed yet from the collection',
  async () => {
    const collection = new CallbackCollection();

    const listenerA = spy(() => false);
    const listenerB = spy();
    collection.add(listenerA, { onlyOnce: true });
    collection.addOnlyOnce(listenerB); // same like A
    assertEquals(collection.size, 2);

    await collection.invoke('abc');
    assertEquals(collection.size, 1); // although both A and B are only-once, but listenerA should NOT be removed as it returned false
    assertSpyCalls(listenerA, 1);
    assertSpyCalls(listenerB, 1);

    await collection.invoke('abc'); // if the same event happens again, the only-once callbacks should NOT be invoked again
    assertSpyCalls(listenerA, 2);
    assertSpyCalls(listenerB, 1);
  }
);

Deno.test('.invoke, returns array of the callbacks results', async () => {
  const collection = new CallbackCollection();

  const listenerA = spy((x) => `${x}_1`);
  const listenerB = spy((x) => `${x}_2`);
  collection.add(listenerA, { onlyOnce: true });
  collection.addOnlyOnce(listenerB); // same like A
  assertEquals(collection.size, 2);

  const out = await collection.invoke('abc');
  assertEquals(out, ['abc_1', 'abc_2']);
});

Deno.test('Deletes the callback from the collection', async () => {
  const collection = new CallbackCollection();

  const listenerA = spy();
  const listenerB = spy();
  collection.add(listenerA);
  collection.add(listenerB);
  assertEquals(collection.size, 2);
  collection.delete(listenerB);
  assertEquals(collection.size, 1);

  const out = await collection.invoke('abc');
  assertEquals(out, [undefined]); // listener is not returning a value
  assertSpyCalls(listenerA, 1);
  assertSpyCalls(listenerB, 0);
});

Deno.test('Clears the collecion', async () => {
  const collection = new CallbackCollection();

  const listenerA = spy();
  const listenerB = spy();
  collection.add(listenerA, { onlyOnce: true });
  collection.add(listenerB, { onlyOnce: true });
  collection.clear();
  assertEquals(collection.size, 0);

  await collection.invoke('abc');
  assertSpyCalls(listenerA, 0);
  assertSpyCalls(listenerB, 0);
});

Deno.test(
  'Same callback can be added more than once and can be deleted accordingly',
  async () => {
    const listenerX = spy();

    const collection = new CallbackCollection();

    collection.add(listenerX);
    collection.add(listenerX); // twice
    collection.add(listenerX); // third
    assertEquals(collection.size, 3);

    await collection.invoke();

    collection.delete(listenerX); // delete once
    assertEquals(collection.size, 2);

    await collection.invoke();
    collection.delete(listenerX); // delete twice
    assertEquals(collection.size, 1);

    await collection.invoke();
    collection.delete(listenerX); // delete third
    assertEquals(collection.size, 0);

    await collection.invoke();
    assertSpyCalls(listenerX, 6);
  }
);

Deno.test(
  'Invokes the callbacks, multiple times considering the "onlyOnce" option',
  async () => {
    const collection = new CallbackCollection();

    const listenerA = spy();
    collection.add(listenerA, { onlyOnce: true });

    const listenerB = spy();
    collection.add(listenerB);

    assertEquals(collection.size, 2);

    await collection.invoke('abc');
    assertEquals(collection.size, 1);
    assertSpyCall(listenerA, 0, { args: ['abc'] });
    assertSpyCall(listenerB, 0, { args: ['abc'] });

    const listenerC = spy();
    collection.addOnlyOnce(listenerC);
    assertEquals(collection.size, 2);

    await collection.invoke('def');
    assertSpyCall(listenerB, 1, { args: ['def'] });
    assertSpyCall(listenerC, 0, { args: ['def'] });

    await collection.invoke('ghi');
    assertSpyCall(listenerB, 2, { args: ['ghi'] });

    assertSpyCalls(listenerA, 1);
    assertSpyCalls(listenerB, 3);
    assertSpyCalls(listenerC, 1);
  }
);
