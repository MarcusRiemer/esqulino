import { BlattWerkzeugError } from "../blattwerkzeug-error";
import { codeGeneratorFromGrammar } from "./codegenerator-automatic";
import { NamedLanguages, VisualisedLanguages } from "./grammar.description";
import { Node, Tree, QualifiedTypeName } from "./syntaxtree";

export enum OutputSeparator {
  NONE,
  SPACE_BEFORE = 1 << 0,
  SPACE_AFTER = 1 << 2,
  NEW_LINE_BEFORE = 1 << 3,
  NEW_LINE_AFTER = 1 << 4,
}

const ANY_BEFORE =
  OutputSeparator.SPACE_BEFORE | OutputSeparator.NEW_LINE_BEFORE;
const ANY_AFTER = OutputSeparator.SPACE_AFTER | OutputSeparator.NEW_LINE_AFTER;
const ANY_SPACE = OutputSeparator.SPACE_BEFORE | OutputSeparator.SPACE_AFTER;
const ANY_NEW_LINE =
  OutputSeparator.NEW_LINE_BEFORE | OutputSeparator.NEW_LINE_AFTER;

/**
 * Represents a node that has been compiled into its string
 * representation.
 */
export type GeneratedNode = Readonly<{
  depth: number;
  compilation: string;
  node: Node;
  sep: OutputSeparator;
}>;

/**
 * Bundles data that is collected during code generation.
 */
export class CodeGeneratorProcess<TState extends {}> {
  private static INDENT = "  "; // The string that is used to indent stuff

  private _generated: GeneratedNode[] = [];
  private _currentDepth: number = 0;

  /**
   * Some code generation processes need to know whether sub trees
   * did actually emit code to get things like indentation correct.
   * These lists are managed by @see trackChanges and filled by
   * @see addConvertedFragment.
   */
  private _trackLists: GeneratedNode[][] = [];

  constructor(private _generator: CodeGenerator, readonly state?: TState) {}

  /**
   * Adds some compiled node to the current result.
   *
   * @param compilation The compiled string that was generated from the node
   * @param node The node this fragment was generated from. This is useful when
   *             debugging generator code or to provide source maps.
   * @param sep Separators that should be applied to the fragment. May not mix
   *            spaces and newlines.
   */
  addConvertedFragment(
    compilation: string,
    node: Node,
    sep = OutputSeparator.NONE
  ) {
    if (compilation === undefined) {
      throw new BlattWerkzeugError(`Added undefined emitted string`);
    }

    // Corner case: The depth of the first fragment may be > 0 which would
    // indicate that `indent` was called before anything was written. This
    // seldom happens in "real" code generators but is surprisingly common
    // in tests. This workaround ensures that the first entry is always
    // properly indented.
    //
    // Although directly modifying the input is nasty, every other workaround
    // (like inserting "artificially generated" fragments) is also quite nasty.
    // And not doing this would leave the nastyness of loads of testcases that
    // need to accomodate for the special indentation rules for the first
    // item of a sequence.
    if (this._generated.length === 0 && this._currentDepth > 0) {
      compilation =
        CodeGeneratorProcess.INDENT.repeat(this._currentDepth) + compilation;
    }

    // Mixing newlines and space options is not allowed
    if ((sep & ANY_SPACE) > 0 && (sep & ANY_NEW_LINE) > 0) {
      const msg = `Attempted to mix spaces and newlines during code generation`;
      throw new BlattWerkzeugError(msg, {
        compilation,
        node,
        sep,
      });
    }

    const newNode = Object.freeze({
      depth: this._currentDepth,
      compilation,
      node,
      sep,
    });

    this._generated.push(newNode);
    this._trackLists.forEach((t) => t.push(newNode));
  }

  /**
   * Executes the given function in a context where every call to @see addConvertedFragment
   * is done at an extra level of indentation. Also ensures that the very last fragment that
   * is emitted sets a new line afterwards, otherwise the next level of indentation could
   * logically continue on the same level (if it wouldn't start a newline).
   */
  indent(indentedCalls: () => void) {
    this._currentDepth++;
    const changes = this.trackChanges(indentedCalls);

    if (changes.length > 0) {
      const lastChange = changes[changes.length - 1];
      // "Smuggle" in a new line if the indentation doesn't end with a newline
      if ((lastChange.sep & OutputSeparator.NEW_LINE_AFTER) == 0) {
        const index = this._generated.indexOf(lastChange);
        this._generated.splice(index, 1, {
          ...lastChange,
          sep: lastChange.sep | OutputSeparator.NEW_LINE_AFTER,
        });
      }
    }

    this._currentDepth--;
  }

  /**
   * Tracks all changes that happen during the execution of the passed function.
   */
  trackChanges(trackedCalls: () => void): GeneratedNode[] {
    const trackList: GeneratedNode[] = [];
    this._trackLists.push(trackList);

    trackedCalls();

    const index = this._trackLists.indexOf(trackList);
    if (index >= 0) {
      this._trackLists.splice(index, 1);
    } else {
      throw new BlattWerkzeugError(
        `CodeGeneration: Didn't find previously crated track list`
      );
    }

    return trackList;
  }

  /**
   * Generates code for the given node
   */
  generateNode(node: Node) {
    if (!node) {
      throw new Error("Can't generate node for falsy value");
    }

    const converter = this._generator.getConverter(node.qualifiedName);
    converter.init(node, this);
  }

  emit(): string {
    // First and last separators are sometimes irrelevant, all
    // other elements need the appropriate separation characters
    const first = this._generated[0];
    const last = this._generated[this._generated.length - 1];

    // Picks the correct separation character and position
    const sepChar = (gen: GeneratedNode, i: number) => {
      // The final separation character may change under various circumstances (read on)
      let finalSep = gen.sep;

      // Are these first or last elements with irrelevant separators?
      const firstBefore =
        gen === first &&
        ((gen.sep & OutputSeparator.NEW_LINE_BEFORE) > 0 ||
          (gen.sep & OutputSeparator.SPACE_BEFORE) > 0);
      const lastAfter =
        gen == last &&
        ((gen.sep & OutputSeparator.NEW_LINE_AFTER) > 0 ||
          (gen.sep & OutputSeparator.SPACE_AFTER) > 0);
      if (firstBefore) {
        finalSep &= ~ANY_BEFORE;
      }

      if (lastAfter) {
        finalSep &= ~ANY_AFTER;
      }

      // Does the seperator match the previous separator?
      const previous = this._generated[i - 1];
      if (previous && finalSep != OutputSeparator.NONE) {
        let prevSep = previous.sep;
        // Would this lead to two newlines?
        const doubleNewline =
          (prevSep & OutputSeparator.NEW_LINE_AFTER) > 0 &&
          (finalSep & OutputSeparator.NEW_LINE_BEFORE) > 0;
        // Or to two spaces?
        const doubleSpace =
          (prevSep & OutputSeparator.SPACE_AFTER) > 0 &&
          (finalSep & OutputSeparator.SPACE_BEFORE) > 0;

        // In that case we disregard this leading separator
        if (doubleNewline) {
          finalSep &= ~OutputSeparator.NEW_LINE_BEFORE;
        }
        if (doubleSpace) {
          finalSep &= ~OutputSeparator.SPACE_BEFORE;
        }
      }

      // Applying the separator and possibly indentation (for newlines)
      let result = gen.compilation;

      if ((finalSep & OutputSeparator.SPACE_BEFORE) > 0) {
        result = " " + result;
      }
      if ((finalSep & OutputSeparator.SPACE_AFTER) > 0) {
        result += " ";
      }

      if ((finalSep & OutputSeparator.NEW_LINE_BEFORE) > 0) {
        result = "\n" + result;
      }
      if ((finalSep & OutputSeparator.NEW_LINE_AFTER) > 0) {
        result += "\n";
      }

      return result;
    };

    const INDENT = CodeGeneratorProcess.INDENT;
    const indent = (fragment: string, i: number, all: string[]) => {
      if (fragment.startsWith("\n")) {
        // Insert indentation characters after newline
        return (
          "\n" + INDENT.repeat(this._generated[i].depth) + fragment.substring(1)
        );
      }
      // Is there something coming after the newline?
      else if (fragment.endsWith("\n") && i + 1 < all.length) {
        // Insert indentation characters for the next element after newline
        return fragment + INDENT.repeat(this._generated[i + 1].depth);
      } else {
        return fragment;
      }
    };

    return this._generated.map(sepChar).map(indent).join("");
  }
}

/**
 * Controls how a node is converted to text and what the children
 * have to do with it.
 */
export interface NodeConverter<T extends {}> {
  /*
   * This function is called when the node is entered.
   */
  init(node: Node, process: CodeGeneratorProcess<T>): void;
}

/**
 * Used to register a NodeConverter for a certain type.
 */
export interface NodeConverterRegistration {
  converter: NodeConverter<any>;
  type: QualifiedTypeName;
}

/**
 * Registers callbacks per language per type.
 */
export type RegisteredCodeGenerators = {
  [langName: string]: { [typeName: string]: NodeConverter<any> };
};

/**
 * Transforms an AST into its compiled string representation.
 */
export class CodeGenerator {
  private _callbacks: RegisteredCodeGenerators = {};
  private _state?: any;

  constructor(
    converters: NodeConverterRegistration[],
    private types: NamedLanguages | VisualisedLanguages = {},
    state: any[] = []
  ) {
    // Merge all the given states into a single object
    this._state = Object.assign({}, ...state);

    // Remember every explicit converter
    converters.forEach((c) => this.registerConverter(c.type, c.converter));
  }

  /**
   * Registers a new converter for a certain type. Currently
   * duplicate converters are not allowed, so it is not possible
   * to unintentionally overwrite already registered convertes.
   */
  private registerConverter(
    t: QualifiedTypeName,
    converter: NodeConverter<any>
  ) {
    if (this.hasExplicitConverter(t)) {
      throw new BlattWerkzeugError(
        `There is already a converter for "${t.languageName}.${t.typeName}"`
      );
    } else {
      if (!this._callbacks[t.languageName]) {
        this._callbacks[t.languageName] = {};
      }
      this._callbacks[t.languageName][t.typeName] = converter;
    }
  }

  /**
   * @param ast The tree to emit.
   */
  emit(ast: Node | Tree): string {
    let rootNode: Node = undefined;

    if (ast instanceof Tree && !ast.isEmpty) {
      rootNode = ast.rootNode;
    } else if (ast instanceof Node) {
      rootNode = ast;
    }

    if (rootNode) {
      // Make a deep copy of the given state
      const stateCopy = JSON.parse(JSON.stringify(this._state));
      const process = new CodeGeneratorProcess(this, stateCopy);
      process.generateNode(rootNode);

      return process.emit();
    } else {
      throw new Error("Attempted to generate code for empty tree");
    }
  }

  /**
   * @return True if there is a converter for the given type.
   */
  hasExplicitConverter(t: QualifiedTypeName) {
    return !!(
      this._callbacks[t.languageName] &&
      this._callbacks[t.languageName][t.typeName]
    );
  }

  /**
   * @return True, if it would be possible to implicitly generate
   *         something for the given type.
   */
  hasImplicitConverter(t: QualifiedTypeName) {
    return !!this.types?.[t.languageName]?.[t.typeName];
  }

  /**
   * @return A converter for the type in question.
   */
  getConverter(t: QualifiedTypeName): NodeConverter<any> {
    let err: BlattWerkzeugError | undefined = undefined;

    if (!this._callbacks[t.languageName]) {
      err = new BlattWerkzeugError(
        `Language "${
          t.languageName
        }" is unknown to CodeGenerator, available languages are: [${Object.keys(
          this._callbacks
        ).join(", ")}]`
      );
    }

    if (!err && !this._callbacks[t.languageName][t.typeName]) {
      err = new BlattWerkzeugError(
        `Type "${t.languageName}.${t.typeName}" is unknown to CodeGenerator`
      );
    }

    // Try to return an implicit converter if there has been an error
    if (err) {
      if (this.hasImplicitConverter(t)) {
        return {
          init: (node: Node, process: CodeGeneratorProcess<any>) =>
            codeGeneratorFromGrammar(this.types, node, process),
        };
      } else {
        throw err;
      }
    } else {
      return this._callbacks[t.languageName][t.typeName];
    }
  }
}
