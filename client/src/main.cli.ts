import * as readline from 'readline'
import * as process from 'process'

import { prettyPrintGrammar } from './app/shared/syntaxtree/prettyprint'
import { GrammarDescription } from './app/shared/syntaxtree/validator.description'

import * as dxml from './app/shared/syntaxtree/dxml/dxml.validator'
import * as regex from './app/shared/syntaxtree/regex/regex.validator'
import * as sql from './app/shared/syntaxtree/sql/sql.validator'


interface PrintGrammarCommand {
  type: "printGrammar",
  id: string;
}

interface AvailableGrammarsCommand {
  type: "available"
}

type Command = PrintGrammarCommand | AvailableGrammarsCommand;

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
 * Executes the given command
 */
function executeCommand(command: Command) {
  switch (command.type) {
    case "printGrammar":
      const g = findGrammar(command.id);
      return (prettyPrintGrammar(g));
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
