import * as readline from "readline";
import * as process from "process";
import { URL } from "url";

import { httpRequest } from "./cli/request-promise";

import { Tree } from "./app/shared/syntaxtree/syntaxtree";

import { ServerApi } from "./app/shared/serverdata/serverapi";

import { AvailableLanguages } from "./app/shared/syntaxtree/";
import {
  graphvizSyntaxTree,
  prettyPrintGrammar,
} from "./app/shared/syntaxtree/prettyprint";
import { referencedResourceIds } from "./app/shared/syntaxtree/syntaxtree-util";
import { NodeDescription } from "./app/shared/syntaxtree/syntaxtree.description";
import { GrammarDescription } from "./app/shared/syntaxtree/grammar.description";

import {
  BlockLanguageDescription,
  BlockLanguageListDescription,
} from "./app/shared/block/block-language.description";
import { prettyPrintBlockLanguage } from "./app/shared/block/prettyprint";
import { BlockLanguageGeneratorDocument } from "./app/shared/block/generator/generator.description";
import { generateBlockLanguage } from "./app/shared/block/generator/generator";

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
interface EmitCodeCommand {
  type: "emitCode";
  ast: NodeDescription;
  languageId: string;
}

/**
 * Prints the compiled version of the given syntaxtree.
 */
interface EmitGeneratedBlocksCommand {
  type: "emitGeneratedBlocks";
  blockLanguage: BlockLanguageListDescription;
  generator: BlockLanguageGeneratorDocument;
  grammar: GrammarDescription;
}

/**
 * A list of all available programming languages.
 */
interface AvailableProgrammingLanguagesCommand {
  type: "available";
}

/**
 * All code resources that are referenced
 */
interface ReferencedCodeResourcesCommand {
  type: "referencedCodeResources" | "referencedGrammars";
  ast: NodeDescription;
  grammar: GrammarDescription;
}

type Command =
  | PingCommand
  | PrintGrammarCommand
  | PrintBlockLanguageCommand
  | AvailableProgrammingLanguagesCommand
  | GraphvizSyntaxTreeCommand
  | EmitCodeCommand
  | EmitGeneratedBlocksCommand
  | ReferencedCodeResourcesCommand;

// Knows all URLs that are available to the API
const serverApi = new ServerApi("http://localhost:9292/api");

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

class BufferedStdoutError {
  constructor(public buffer: any[], public error: Error) {}
}

/**
 * Executes the given function with a swapped out console.log object. If nothing
 * goes wrong the buffered output is discarded, if something goes wrong it
 * is made part of the thrown exception.
 */
export async function saveLogOutput(f: () => Promise<Object | string>) {
  const oldRef = console.log;
  const buffer = [];

  try {
    console.log = function () {
      buffer.push(arguments);
    };
    return await f();
  } catch (exception) {
    throw new BufferedStdoutError(buffer, exception);
  } finally {
    console.log = oldRef;
  }
}

/**
 * Executes the given command
 */
async function executeCommand(command: Command): Promise<Object | string> {
  const result = saveLogOutput(async () => {
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
      case "emitCode": {
        if (command.languageId !== "generic") {
          const l = findLanguage(command.languageId);
          const t = new Tree(command.ast);
          return l.emitTree(t);
        } else {
          return "Generic Language without code generator";
        }
      }
      case "emitGeneratedBlocks": {
        return generateBlockLanguage(
          command.blockLanguage,
          command.generator,
          command.grammar
        );
      }
      case "referencedCodeResources":
      case "referencedGrammars": {
        const searched =
          command.type === "referencedCodeResources"
            ? "codeResourceReference"
            : "grammarReference";
        return referencedResourceIds(command.ast, command.grammar, searched);
      }
    }
  });

  return result;
}

// Each given line is expected to be a self contained JSON object.
export function handleLine(line: string) {
  try {
    const command = JSON.parse(line) as Command;
    let result = executeCommand(command);

    // Did we get something meaningful back?
    if (result !== undefined) {
      Promise.resolve(result)
        .then((res) => {
          console.log(JSON.stringify(res));
        })
        .catch((err: unknown | BufferedStdoutError) => {
          console.error(`Error during operation "${command.type}"`);
          if (err instanceof BufferedStdoutError) {
            console.error(
              `Log output of failed operation: `,
              JSON.stringify(err.buffer)
            );
          }
          console.error(err);
        });
    } else {
      console.error("Unknown operation");
    }
  } catch (e) {
    console.error("Invalid command");
    console.error(e);
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.on("line", handleLine);
