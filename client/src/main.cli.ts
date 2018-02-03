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

import * as blocks_dxml from './app/shared/block/dxml/language-model'
import * as blocks_sql from './app/shared/block/sql/language-model'

interface PrintGrammarCommand {
  type: "printGrammar",
  id: string;
}

interface PrintLanguageModelCommand {
  type: "printLanguageModel",
  id: string;
}

interface GraphvizSyntaxTreeCommand {
  type: "graphvizTree",
  model: NodeDescription;
}

interface EmitSyntaxTreeCommand {
  type: "emitTree",
  model: NodeDescription;
  languageId: string;
}

interface AvailableGrammarsCommand {
  type: "available"
}

type Command = PrintGrammarCommand | PrintLanguageModelCommand | AvailableGrammarsCommand | GraphvizSyntaxTreeCommand | EmitSyntaxTreeCommand;

function availableLanguages(): LanguageDescription[] {
  return ([
    dxml.LANGUAGE_DESCRIPTION_ERUBY,
    dxml.LANGUAGE_DESCRIPTION_LIQUID,
    regex.LANGUAGE_DESCRIPTION,
    sql.LANGUAGE_DESCRIPTION
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
  return (availableGrammars().find(d => d.languageName === name));
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
function findLanguageModel(id: string): BlockLanguageDescription {
  return (availableLanguageModels().find(l => l.id == id));
}

/**
 * Executes the given command
 */
function executeCommand(command: Command) {
  switch (command.type) {
    case "printGrammar":
      const g = findGrammar(command.id);
      return (prettyPrintGrammar(g));
    case "printLanguageModel": {
      const l = findLanguageModel(command.id);
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
