import * as readline from 'readline'
import * as process from 'process'

import { prettyPrintGrammar } from './app/shared/syntaxtree/prettyprint'
import { GrammarDescription } from './app/shared/syntaxtree/validator.description'

import * as dxml from './app/shared/syntaxtree/dxml/dxml.validator'
import * as regex from './app/shared/syntaxtree/regex/regex.validator'

interface Command {
  type: string;
}

interface PrintGrammarCommand extends Command {
  type: "printGrammar",
  name: string;
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line) {
  try {
    const command = JSON.parse(line) as PrintGrammarCommand;
    switch (command.type) {
      case "printGrammar":
        console.log(prettyPrintGrammar(regex.GRAMMAR_DESCRIPTION));
        break;
    }
  } catch (e) {
    console.error(e);
  }
});

console.log("BlattWerkzeug CLI started - Waiting for JSON requests");
