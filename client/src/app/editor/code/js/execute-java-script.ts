export interface ExecutionMessage {
  message: string;
  channel: "log" | "error" | "warn";
  timestamp: number;
}

export interface ExecutionOutput extends ExecutionMessage {
  timestamp: number;
}

function isExecutionMessage(msg: unknown): msg is ExecutionMessage {
  return msg instanceof Object && "message" in msg && "channel" in msg;
}

export interface ExecutionResult {
  output: ExecutionOutput[];
  result: unknown;
  finished: boolean;
  started: boolean;
  error: false | unknown;
  runtime: number;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const workerApiSrc = `
const __appendOutput = (
  args, channel
) => {
  postMessage({
    channel,
    message: args.map((a) => "" + a).join(""),
  });
};

const console = {
  log(...args) {
    __appendOutput(args, "log");
  },
  error(...args) {
    __appendOutput(args, "error");
  },
};

postMessage("start");`;

const workerApiEnd = `
postMessage("end");
`;

// This seems to be laughably slow in Firefox when run in Jasmine
// but blazingly fast in the Typescript playground, no idea
// why this could be the case :-(
export async function executeJavaScriptProgram(
  code: string,
  timeoutInMs = 5000
): Promise<ExecutionResult> {
  const result: ExecutionResult = {
    output: [],
    result: undefined,
    finished: false,
    started: false,
    error: false,
    runtime: 0,
  };

  // const workerSrc = [workerApiSrc, "onmessage = function() {", code, "}"].join("\n");
  const workerSrc = [workerApiSrc, code, workerApiEnd].join("\n");
  const blobUrl = URL.createObjectURL(new Blob([workerSrc]));

  // Required in "finally"
  let worker: Worker = undefined;

  try {
    const startTime = Date.now();

    console.log("Creating web worker with Blob url: ", blobUrl);

    worker = new Worker(blobUrl, {
      type: "classic",
    });

    worker.addEventListener("error", (errEvt) => {
      console.error("JavaScript execution web worker error", errEvt);
      // Don't count all those lines of the preface
      const line = (workerApiSrc.match(/\n/g) ?? "").length - errEvt.lineno;
      result.error = {
        line,
        message: errEvt.message,
      };
    });

    worker.addEventListener("message", (msg) => {
      if (msg.data === "start") {
        result.started = true;
      } else if (msg.data === "end") {
        result.finished = true;
        result.runtime = Date.now() - startTime;
      } else if (isExecutionMessage(msg.data)) {
        result.output.push(
          Object.assign({}, msg.data, { timestamp: Date.now() - startTime })
        );
      }
    });

    // Busy waiting
    while (
      result.error === false &&
      !result.finished &&
      startTime + timeoutInMs > Date.now()
    ) {
      await sleep(10);
    }
  } catch (e) {
    result.error = e;
  } finally {
    worker?.terminate();
    URL.revokeObjectURL(blobUrl);
  }

  return result;
}
