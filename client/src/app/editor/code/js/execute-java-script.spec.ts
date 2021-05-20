import { executeJavaScriptProgram } from "./execute-java-script";

fdescribe(`Execute JavaScript`, () => {
  let originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

  beforeAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 5000;
  });

  afterAll(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  describe(`Program`, () => {
    it(`empty`, async () => {
      const result = await executeJavaScriptProgram(``);

      console.log("Runtime: ", result.runtime);

      expect(result).toEqual(
        jasmine.objectContaining({
          result: undefined,
          started: true,
          finished: true,
          output: [],
        })
      );
    });

    it(`console.log("42");`, async () => {
      const result = await executeJavaScriptProgram(`console.log("42");`);

      console.log("Runtime: ", result.runtime);

      expect(result).toEqual(
        jasmine.objectContaining({
          result: undefined,
          started: true,
          finished: true,
          output: [{ channel: "log", message: "42" }],
        })
      );
    });
  });
});
