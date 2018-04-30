import * as Desc from './grammar.description'
import * as AST from './syntaxtree'

import { ErrorCodes, ValidationContext, ValidationResult } from './validation-result'
import { GrammarValidator, NodeType } from './grammar'

/**
 * A validator receives instances of one or multiple schemas and will
 * check any AST against those languages.
 */
export class Validator {
  private _registeredGrammars: { [langName: string]: GrammarValidator } = {};

  constructor(langs: Desc.GrammarDescription[]) {
    langs.forEach(langDesc => this.register(langDesc));
  }

  /**
   * @return All individual schemas that are part of this validator.
   */
  get availableSchemas() {
    return (Object.entries(this._registeredGrammars).map(([name, types]) => {
      return ({
        name: name,
        grammar: types
      });
    }));
  }

  /**
   * @return All types that are known to this validator.
   */
  get availableTypes(): NodeType[] {
    return (
      Object.values(this._registeredGrammars)
        .map(v => v.availableTypes)
        .reduce((lhs, rhs) => lhs.concat(rhs), [])
    );
  }

  /**
   * Registers a new language with this validator
   */
  private register(desc: Desc.GrammarDescription) {
    if (this.isKnownLanguage(desc.languageName)) {
      throw new Error(`Attempted to register language "${desc.languageName}" twice`);
    }

    this._registeredGrammars[desc.languageName] = new GrammarValidator(this, desc);
  }

  /**
   * @param ast The root of the AST to validate
   * @return All errors that occured during evaluation
   */
  validateFromRoot(ast: AST.Node | AST.Tree) {
    // Grab the actual root
    let rootNode: AST.Node = undefined;
    if (ast instanceof AST.Tree && !ast.isEmpty) {
      rootNode = ast.rootNode;
    } else if (ast instanceof AST.Node) {
      rootNode = ast;
    }

    const context = new ValidationContext();

    if (rootNode) {
      if (this.isKnownLanguage(rootNode.languageName)) {
        // Pass validation to the appropriate language
        const lang = this.getLanguageGrammar(rootNode.languageName);
        lang.validateFromRoot(rootNode, context);
      } else {
        // Not knowing the language is a single error
        const available = Array.from(new Set(this.availableTypes.map(t => t.languageName)));
        context.addError(ErrorCodes.UnknownRootLanguage, rootNode, {
          requiredLanguage: rootNode.languageName,
          availableLanguages: available
        });
      }
    } else {
      // Not having a document is a single error
      context.addError(ErrorCodes.Empty, undefined);
    }

    return (new ValidationResult(context));
  }

  /**
   * @return The language that has been asked for. Throws if the language does not exist.
   */
  getLanguageGrammar(language: string) {
    if (!this.isKnownLanguage(language)) {
      const available = Object.keys(this._registeredGrammars).join(', ');
      throw new Error(`Validator does not know language "${language}", known are: ${available}`);
    } else {
      return (this._registeredGrammars[language]);
    }
  }

  /**
   * @return The type that has been asked for. Throws if the type does not exist.
   */
  getType(qualifiedTypename: AST.QualifiedTypeName);
  getType(language: string, typename: string);
  getType(languageOrTypeName: string | AST.QualifiedTypeName, optTypename?: string) {
    let language: string = undefined;
    let typename: string = undefined;

    if (typeof (languageOrTypeName) === "object") {
      language = languageOrTypeName.languageName;
      typename = languageOrTypeName.typeName;
    } else {
      language = languageOrTypeName;
      typename = optTypename;
    }

    if (!this.isKnownType(language, typename)) {
      throw new Error(`Validator does not know type "${language}.${typename}"`);
    } else {
      return (this._registeredGrammars[language].getType(typename));
    }
  }

  /**
   * @return True if the given language is known to this validator.
   */
  isKnownLanguage(language: string) {
    return (!!this._registeredGrammars[language]);
  }

  /**
   * @return True if the given typename is known in the given language.
   */
  isKnownType(language: string, typename: string) {
    return (
      this.isKnownLanguage(language) &&
      this._registeredGrammars[language].isKnownType(typename)
    );
  }
}
