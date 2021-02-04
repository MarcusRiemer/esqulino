import * as readline from "readline";
import * as process from "process";

import { handleLine } from "./cli/exec";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", handleLine);
