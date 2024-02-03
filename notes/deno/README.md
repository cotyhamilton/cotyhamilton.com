---
icon: 🦕
title: 🦕 deno
---

# deno

## decorators

```ts
// deno-lint-ignore no-explicit-any
function trace(value: any, { kind, name }: { kind: string; name: string }) {
  if (kind === "method") {
    return function (...args: unknown[]) {
      console.log(`starting ${name} with arguments ${args.join(", ")}`);
			// console.log(`ENTERED -- ${name} -- ${args.map(arg => JSON.stringify(arg)).join(", ")}`);
      // @ts-ignore this has implicit any type
      const ret = value.call(this, ...args);
      console.log(`ending ${name}`);
      return ret;
    };
  }
}

class C {
  @trace
  m(arg: number) {
    console.log("C.m", arg);
  }
}

new C().m(1);
```
