import * as readline from "readline";
import * as process from "process";
import { URL } from "url";

import { httpRequest } from "./cli/request-promise";

import { Tree } from "./app/shared/syntaxtree/syntaxtree";

import { ServerApi } from "./app/shared/serverdata/serverapi";

import { prettyPrintGrammar } from "./app/shared/syntaxtree/prettyprint";
import { GrammarDescription } from "./app/shared/syntaxtree/grammar.description";

import { AvailableLanguages } from "./app/shared/syntaxtree/";

import { BlockLanguageDescription } from "./app/shared/block/block-language.description";
import { prettyPrintBlockLanguage } from "./app/shared/block/prettyprint";

import { graphvizSyntaxTree } from "./app/shared/syntaxtree/prettyprint";
import { NodeDescription } from "./app/shared/syntaxtree/syntaxtree.description";

/**
 * Can be used to test whether the IDE-service is actually available.
 */
interface PingCommand {
  type: "ping";
}

/**
 * Prints the grammar for a specific language.
 */
interface PrintGrammarCommand {
  type: "printGrammar";
  programmingLanguageId: string;
}

/**
 * Prints the block language definition for a certain language
 */
interface PrintBlockLanguageCommand {
  type: "printBlockLanguage";
  blockLanguageId: string;
}

/**
 * Prints the Graphviz representation of the given model.
 */
interface GraphvizSyntaxTreeCommand {
  type: "graphvizTree";
  model: NodeDescription;
}

/**
 * Prints the compiled version of the given syntaxtree.
 */
interface EmitSyntaxTreeCommand {
  type: "emitTree";
  model: NodeDescription;
  languageId: string;
}

/**
 * Prints a list of all available programming languages.
 */
interface AvailableProgrammingLanguagesCommand {
  type: "available";
}

type Command =
  | PingCommand
  | PrintGrammarCommand
  | PrintBlockLanguageCommand
  | AvailableProgrammingLanguagesCommand
  | GraphvizSyntaxTreeCommand
  | EmitSyntaxTreeCommand;

// Knows all URLs that are avaiable to the API
const serverApi: ServerApi = new ServerApi("http://localhost:9292/api");

/**
 * Retrieves a single grammar by name
 */
async function findGrammar(slug: string) {
  const url = new URL(serverApi.individualGrammarUrl(slug));
  return httpRequest<GrammarDescription>(url, "GET");
}

/**
 * Retrieves a single Language by its name
 */
function findLanguage(id: string) {
  const desc = Object.values(AvailableLanguages).find((l) => l.id == id);
  if (desc) return desc;
  else {
    throw new Error(`Unknown language ${id}`);
  }
}

/**
 * Retrieves a single language model by name.
 */
async function findBlockLanguage(slug: string) {
  const url = new URL(serverApi.individualBlockLanguageUrl(slug));
  return httpRequest<BlockLanguageDescription>(url, "GET");
}

/**
 * Executes the given command
 */
async function executeCommand(command: Command): Promise<string | any[]> {
  switch (command.type) {
    case "ping":
      return "pong";
    case "printGrammar":
      const g = await findGrammar(command.programmingLanguageId);
      return prettyPrintGrammar(command.programmingLanguageId, g);
    case "printBlockLanguage": {
      const l = await findBlockLanguage(command.blockLanguageId);
      return prettyPrintBlockLanguage(l);
    }
    case "graphvizTree":
      return graphvizSyntaxTree(command.model);
    case "emitTree": {
      if (command.languageId !== "generic") {
        const l = findLanguage(command.languageId);
        const t = new Tree(command.model);
        return l.emitTree(t);
      } else {
        return "Generic Language without code generator";
      }
    }
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

// Each given line is expected to be a self contained JSON object.
rl.on("line", function (line) {
  try {
    const command = JSON.parse(line) as Command;
    let result = executeCommand(command);

    // Did we get something meaningful back?
    if (result !== undefined) {
      Promise.resolve(result)
        .then((res) => {
          // One or multiple results?
          if (typeof res === "string") {
            // Exactly on, so no trailing newline please
            console.log(JSON.stringify(res));
          } else {
            // Multiple results
            console.log(`Finished ${res.length} operations`);
            res.forEach((v, i) => {
              console.log(`Operation ${i + 1}: ${JSON.stringify(v)}`);
            });
          }
        })
        .catch((err) => {
          console.error(`Error during operation "${command.type}"`);
          console.error(err);
        });
    } else {
      console.error("Unknown operation");
    }
  } catch (e) {
    console.error("Invalid command");
    console.error(e);
  }
});
