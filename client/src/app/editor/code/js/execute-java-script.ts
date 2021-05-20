export interface ExecutionOutput {
  message: string;
  channel: "log" | "error" | "warn";
}

function isExecutionOutput(msg: unknown): msg is ExecutionOutput {
  return msg instanceof Object && "message" in msg && "channel" in msg;
}

export interface ExecutionResult {
  output: ExecutionOutput[];
  result: unknown;
  finished: boolean;
  started: boolean;
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

postMessage("start");
`;

const workerApiEnd = `
postMessage("end");
`;

export async function executeJavaScriptProgram(
  code: string,
  timeoutInMs = 5000
): Promise<ExecutionResult> {
  const result: ExecutionResult = {
    output: [],
    result: undefined,
    finished: false,
    started: false,
    runtime: 0,
  };

  // const workerSrc = [workerApiSrc, "onmessage = function() {", code, "}"].join("\n");
  const workerSrc = [workerApiSrc, code, workerApiEnd].join("\n");
  const blobUrl = URL.createObjectURL(new Blob([workerSrc]));

  console.log("Running program:\n", workerSrc);

  // Required in "finally"
  let worker: Worker = undefined;

  try {
    const startTime = Date.now();
    worker = new Worker(blobUrl, {
      type: "classic",
    });
    worker.addEventListener("message", (msg) => {
      if (msg.data === "start") {
        result.started = true;
      } else if (msg.data === "end") {
        result.finished = true;
        result.runtime = Date.now() - startTime;
      } else if (isExecutionOutput(msg.data)) {
        result.output.push(msg.data);
      }
    });

    // Busy waiting
    while (!result.finished && startTime + timeoutInMs > Date.now()) {
      await sleep(10);
    }
    return result;
  } finally {
    worker?.terminate();
    URL.revokeObjectURL(blobUrl);
  }
}
