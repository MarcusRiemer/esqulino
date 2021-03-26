import { urlParamsFromObject } from "./util-browser";

describe(`Util Browser`, () => {
  describe(`urlParamsFromObject`, () => {
    const runTest = (obj: Object, exp: string) => {
      it(JSON.stringify(obj), () => {
        expect(urlParamsFromObject(obj)).toEqual(exp);
      });
    };

    runTest({}, "");
    runTest({ a: "one" }, "a=one");
    runTest({ a: "one", b: "two" }, "a=one&b=two");
    runTest({ a: { b: "two" } }, "a[b]=two");
    runTest({ a: { b: "two" }, c: "three" }, "a[b]=two&c=three");
    runTest(
      { a: { b: "two" }, c: "three", d: { e: "four" } },
      "a[b]=two&c=three&d[e]=four"
    );
  });
});
