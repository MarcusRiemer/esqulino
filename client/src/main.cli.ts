import * as readline from 'readline'
import * as process from 'process'

import { Tree } from './app/shared/syntaxtree/syntaxtree'

import { prettyPrintGrammar } from './app/shared/syntaxtree/prettyprint'
import { GrammarDescription } from './app/shared/syntaxtree/validator.description'

import { LanguageDescription } from './app/shared/syntaxtree/language.description'
import { Language } from './app/shared/syntaxtree/language'

import { BlockLanguageDescription } from './app/shared/block/block-language.description'
import { prettyPrintLanguageModel } from './app/shared/block/prettyprint'

import { graphvizSyntaxTree } from './app/shared/syntaxtree/prettyprint'
import { NodeDescription } from './app/shared/syntaxtree/syntaxtree.description'

import * as dxml from './app/shared/syntaxtree/dxml/'
import * as regex from './app/shared/syntaxtree/regex/'
import * as sql from './app/shared/syntaxtree/sql/'
import * as css from './app/shared/syntaxtree/css/'

import * as blocks_dxml from './app/shared/block/dxml/language-model'
import * as blocks_sql from './app/shared/block/sql/language-model'

/**
 * Can be used to test whether the IDE-service is actually available.
 */
interface PingCommand {
  type: "ping"
}

/**
 * Prints the grammar for a specific language.
 */
interface PrintGrammarCommand {
  type: "printGrammar"
  programmingLanguageId: string
}

/**
 * Prints the block language definition for a certain language
 */
interface PrintBlockLanguageCommand {
  type: "printBlockLanguage"
  blockLanguageId: string
}

/**
 * Prints the Graphviz representation of the given model.
 */
interface GraphvizSyntaxTreeCommand {
  type: "graphvizTree"
  model: NodeDescription
}

/**
 * Prints the compiled version of the given syntaxtree.
 */
interface EmitSyntaxTreeCommand {
  type: "emitTree"
  model: NodeDescription
  languageId: string
}

/**
 * Prints a list of all available programming languages.
 */
interface AvailableProgrammingLanguagesCommand {
  type: "available"
}

type Command = PingCommand | PrintGrammarCommand | PrintBlockLanguageCommand | AvailableProgrammingLanguagesCommand | GraphvizSyntaxTreeCommand | EmitSyntaxTreeCommand;

function availableLanguages(): LanguageDescription[] {
  return ([
    dxml.LANGUAGE_DESCRIPTION_ERUBY,
    dxml.LANGUAGE_DESCRIPTION_LIQUID,
    regex.LANGUAGE_DESCRIPTION,
    sql.LANGUAGE_DESCRIPTION,
    css.LANGUAGE_DESCRIPTION,
  ]);
}

/**
 * Retrieves all grammars that are known to this instance.
 */
function availableGrammars(): GrammarDescription[] {
  return (availableLanguages().map(l => l.validators[0]));
}

/**
 * Retrieves a single grammar by name
 */
function findGrammar(name: string) {
  const toReturn = availableGrammars().find(d => d.languageName === name);
  if (toReturn) {
    return (toReturn);
  } else {
    throw new Error(`Unknown language "${name}"`);
  }
}

function findLanguage(id: string) {
  const desc = availableLanguages().find(l => l.id == id);
  if (desc)
    return (new Language(desc));
  else
    throw new Error(`Unknown language ${id}`);
}

/**
 * All available language models
 */
function availableLanguageModels(): BlockLanguageDescription[] {
  return ([
    blocks_dxml.LANGUAGE_MODEL,
    blocks_dxml.DYNAMIC_LANGUAGE_MODEL,
    blocks_sql.LANGUAGE_MODEL
  ]);
}

/**
 * Retrieves a single language model by name.
 */
function findLanguageModel(slug_or_id: string): BlockLanguageDescription {
  return (availableLanguageModels().find(l => l.id == slug_or_id || l.slug == slug_or_id));
}

/**
 * Executes the given command
 */
function executeCommand(command: Command) {
  switch (command.type) {
    case "ping":
      return ("pong");
    case "printGrammar":
      const g = findGrammar(command.programmingLanguageId);
      return (prettyPrintGrammar(g));
    case "printBlockLanguage": {
      const l = findLanguageModel(command.blockLanguageId);
      return (prettyPrintLanguageModel(l));
    }
    case "available":
      return (availableGrammars().map(g => g.languageName));
    case "graphvizTree":
      return (graphvizSyntaxTree(command.model));
    case "emitTree": {
      const l = findLanguage(command.languageId);
      const t = new Tree(command.model);
      return (l.emitTree(t));
    }
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Each given line is expected to be a self contained JSON object.
rl.on('line', function(line) {
  try {
    const command = JSON.parse(line) as Command;
    let result = executeCommand(command);

    if (result !== undefined) {
      console.log(JSON.stringify(result));
    }
  } catch (e) {
    console.error(e);
  }
});
