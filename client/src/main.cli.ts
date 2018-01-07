import * as readline from 'readline'
import * as process from 'process'

import { prettyPrintGrammar } from './app/shared/syntaxtree/prettyprint'
import { GrammarDescription } from './app/shared/syntaxtree/validator.description'

import { LanguageModelDescription } from './app/shared/block/language-model.description'
import { prettyPrintLanguageModel } from './app/shared/block/prettyprint'

import * as dxml from './app/shared/syntaxtree/dxml/dxml.validator'
import * as regex from './app/shared/syntaxtree/regex/regex.validator'
import * as sql from './app/shared/syntaxtree/sql/sql.validator'

import * as lang_dxml from './app/shared/block/dxml/language-model'

interface PrintGrammarCommand {
  type: "printGrammar",
  id: string;
}

interface PrintLanguageModelCommand {
  type: "printLanguageModel",
  id: string;
}

interface AvailableGrammarsCommand {
  type: "available"
}

type Command = PrintGrammarCommand | PrintLanguageModelCommand | AvailableGrammarsCommand;

/**
 * Retrieves all grammars that are known to this instance.
 */
function availableGrammars(): GrammarDescription[] {
  return ([dxml.GRAMMAR_DESCRIPTION, regex.GRAMMAR_DESCRIPTION, sql.GRAMMAR_DESCRIPTION]);
}

/**
 * Retrieves a single grammar by name
 */
function findGrammar(name: string) {
  return (availableGrammars().find(d => d.languageName === name));
}

/**
 * All available language models
 */
function availableLanguageModels(): LanguageModelDescription[] {
  return ([
    lang_dxml.LANGUAGE_MODEL,
    lang_dxml.DYNAMIC_LANGUAGE_MODEL,
  ]);
}

/**
 * Retrieves a single language model by name.
 */
function findLanguageModel(id: string): LanguageModelDescription {
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
    case "printLanguageModel":
      const l = findLanguageModel(command.id);
      return (prettyPrintLanguageModel(l));
    case "available":
      return (availableGrammars().map(g => g.languageName));
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
