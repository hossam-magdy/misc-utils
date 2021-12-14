import { throttle } from "./throttle.ts";
import { assertSpyCalls } from "https://deno.land/x/mock@v0.10.0/asserts.ts";
import { spy } from "https://deno.land/x/mock@v0.10.0/spy.ts";
import { FakeTime } from "https://deno.land/x/mock@v0.10.0/time.ts";

Deno.test("Invokes the callbacks considering the onlyOnce option", () => {
  const time: FakeTime = new FakeTime();
  const fn = spy();
  const throttled = throttle(1000, fn);

  try {
    throttled();
    assertSpyCalls(fn, 1);

    throttled();
    throttled();
    throttled();
    throttled();
    time.tick(999);
    assertSpyCalls(fn, 1);

    time.tick(1);
    assertSpyCalls(fn, 2);
  } finally {
    time.restore();
  }
});
