# 🦕 deno

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

## web workers

```ts
import { delay } from "jsr:@std/async";

function main() {
    const worker = new Worker(import.meta.resolve("./test.ts"), {
        name: "hello-worker",
        type: "module",
    });
    worker.onmessage = (e: MessageEvent<{ message: string }>) => {
        console.log(e.data.message);
    };
    delay(3000).then(() => {
        worker.postMessage({
            message: "hello",
        });
    });
}

if (import.meta.main) {
    if (self.window) {
        main();
    } else {
        const worker = self as unknown as Worker & { name?: string };
        worker.onmessage = (e: MessageEvent<{ message: string }>) => {
            worker.postMessage({
                message: `${e.data.message} from ${worker.name}`,
            });
            self.close();
        };
    }
}
```
