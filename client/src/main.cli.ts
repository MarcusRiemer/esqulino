import * as readline from 'readline'
import * as process from 'process'
import { URL } from 'url'

import { httpRequest } from './cli/request-promise'

import { Tree } from './app/shared/syntaxtree/syntaxtree'

import { prettyPrintGrammar } from './app/shared/syntaxtree/prettyprint'
import { GrammarDescription } from './app/shared/syntaxtree/grammar.description'

import { LanguageDefinition } from './app/shared/syntaxtree/language'
import { Language } from './app/shared/syntaxtree/language'

import { BlockLanguageDescription } from './app/shared/block/block-language.description'
import { prettyPrintBlockLanguage } from './app/shared/block/prettyprint'

import { graphvizSyntaxTree } from './app/shared/syntaxtree/prettyprint'
import { NodeDescription } from './app/shared/syntaxtree/syntaxtree.description'

import * as dxml from './app/shared/syntaxtree/dxml/'
import * as regex from './app/shared/syntaxtree/regex/'
import * as sql from './app/shared/syntaxtree/sql/'
import * as css from './app/shared/syntaxtree/css/'
import * as json from './app/shared/syntaxtree/json/'

import * as blocks_dxml from './app/shared/block/dxml/'
import * as blocks_sql from './app/shared/block/sql/language-model'
import * as blocks_css from './app/shared/block/css/language-model'
import * as blocks_regex from './app/shared/block/regex/language-model'

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

interface UpdateGrammarsCommand {
  type: "updateGrammars"
  serverBaseUrl: string
}

interface UpdateBlockLanguagesCommand {
  type: "updateBlockLanguages"
  serverBaseUrl: string
}

interface UpdateBlockLanguageGeneratorsCommand {
  type: "updateBlockLanguageGenerators"
  serverBaseUrl: string
}

/**
 * Prints a list of all available programming languages.
 */
interface AvailableProgrammingLanguagesCommand {
  type: "available"
}

type Command = PingCommand | PrintGrammarCommand | PrintBlockLanguageCommand | AvailableProgrammingLanguagesCommand | GraphvizSyntaxTreeCommand | EmitSyntaxTreeCommand | UpdateGrammarsCommand | UpdateBlockLanguagesCommand | UpdateBlockLanguageGeneratorsCommand;

function availableLanguages(): LanguageDefinition[] {
  return ([
    dxml.LANGUAGE_DESCRIPTION_ERUBY,
    dxml.LANGUAGE_DESCRIPTION_LIQUID,
    regex.LANGUAGE_DESCRIPTION,
    sql.LANGUAGE_DESCRIPTION,
    css.LANGUAGE_DESCRIPTION,
    json.LANGUAGE_DESCRIPTION
  ]);
}

/**
 * Retrieves all grammars that are known to this instance.
 */
function availableGrammars(): GrammarDescription[] {
  const allGrammars = availableLanguages().map(
    l => l.validators.filter(v => !(v instanceof Function)) as GrammarDescription[]
  )
  return ([].concat(...allGrammars));
}

/**
 * Retrieves a single grammar by name
 */
function findGrammar(name: string) {
  const toReturn = availableGrammars().find(d => d.name === name);
  if (toReturn) {
    return (toReturn);
  } else {
    throw new Error(`Unknown language "${name}"`);
  }
}

/**
 * Retrieves a single Language by its name
 */
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
function availableBlockLanguages(): BlockLanguageDescription[] {
  return ([
    blocks_dxml.BLOCK_LANGUAGE_DYNAMIC,
    blocks_dxml.BLOCK_LANGUAGE_STATIC,
    blocks_sql.BLOCK_LANGUAGE_DESCRIPTION,
    blocks_css.BLOCK_LANGUAGE_DESCRIPTION,
    blocks_regex.BLOCK_LANGUAGE_DESCRIPTION
  ]);
}

/**
 * Retrieves a single language model by name.
 */
function findBlockLanguage(slug_or_id: string): BlockLanguageDescription {
  return (availableBlockLanguages().find(l => l.id == slug_or_id || l.slug == slug_or_id));
}

/**
 * Executes the given command
 */
function executeCommand(command: Command): Promise<string> | any {
  switch (command.type) {
    case "ping":
      return ("pong");
    case "printGrammar":
      const g = findGrammar(command.programmingLanguageId);
      return (prettyPrintGrammar(g));
    case "printBlockLanguage": {
      const l = findBlockLanguage(command.blockLanguageId);
      return (prettyPrintBlockLanguage(l));
    }
    case "available":
      return (availableGrammars().map(g => g.name));
    case "graphvizTree":
      return (graphvizSyntaxTree(command.model));
    case "emitTree": {
      const l = findLanguage(command.languageId);
      const t = new Tree(command.model);
      return (l.emitTree(t));
    }
    case "updateGrammars": {
      // Quick lookup of existing grammar ids
      const grammarIds = new Set(availableGrammars().map(g => g.id));

      const requests = availableGrammars()
        // Ensure that every grammar is sent only once
        .filter(g => {
          const toReturn = grammarIds.has(g.id);
          grammarIds.delete(g.id);
          return (toReturn);
        })
        .map(g => {
          const updateUrl = new URL("/api/grammars/" + g.id, command.serverBaseUrl);
          return (httpRequest<any>(updateUrl, "PUT", g));
        });

      return (Promise.all(requests));
    }
    case "updateBlockLanguages": {
      const requests = availableBlockLanguages()
        .map(b => {
          const updateUrl = new URL("/api/block_languages/" + b.id, command.serverBaseUrl);
          return (httpRequest<any>(updateUrl, "PUT", b));
        });

      return (Promise.all(requests));
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
      if (result instanceof Promise) {
        Promise.resolve(result)
          .then(res => {
            console.log(`Finished ${res.length} operations`);
            res.forEach((v, i) => {
              console.log(`Operation ${i + 1}: ${JSON.stringify(v)}`);
            });
          })
          .catch(err => {
            console.error("Error during operation");
            console.error(JSON.stringify(err, undefined, 2));
          });
      } else {
        console.log(JSON.stringify(result));
      }
    } else {
      console.error("Unknown operation");
    }
  }
  catch (e) {
    console.error(e);
  }
});
