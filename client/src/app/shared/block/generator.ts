import {
  GrammarDescription, NodeConcreteTypeDescription, NodeAttributeDescription,
  NodeTerminalSymbolDescription, NodePropertyTypeDescription,
  NodeChildrenGroupDescription
} from '../syntaxtree/grammar.description'


import {
  BlockLanguageDocument, BlockLanguageListDescription, BlockLanguageDescription
} from './block-language.description'
import {
  VisualBlockDescriptions
} from './block.description'
import {
  BlockLanguageGeneratorDescription, BlockLanguageGeneratorDocument,
  DefaultInstructions, Instructions, TypeInstructions, LayoutInstructions, BlockInstructions, TerminalInstructions
} from './generator.description'
import { EditorBlockDescription } from './block.description'

/**
 * A safe way to access generation instructions. Silently returns empty
 * instructions for all paths without specific instructions.
 */
class SafeGeneratorInstructions {
  constructor(
    private _all: TypeInstructions
  ) {
    if (!this._all) {
      this._all = {};
    }
  }

  scope(g?: string, t?: string, s?: string): Partial<Instructions> {
    let gi = g && this._all[g];
    if (!gi) {
      return ({});
    }

    let ti = t && gi[t];
    if (!ti) {
      return ({});
    }

    let si = s && ti[s];
    if (!si) {
      return ({});
    }

    return si;
  }

  type(grammarName: string, typeName: string) {
    return (new SafeTypeInstructions(this, grammarName, typeName));
  }
}

/**
 * A safe way to access generation instructions that are part of a specific type. 
 * Returned instructions include default properties if no specific properties
 * have been set.
 */
class SafeTypeInstructions {
  constructor(
    private _all: SafeGeneratorInstructions,
    private _grammarName: string,
    private _typeName: string,
  ) { }


  /**
   * @return Layout specific instructions.
   */
  scopeLayout(s: string): LayoutInstructions {
    return (this.cloneWithStyle(this.scope(s), DefaultInstructions.layoutInstructions));
  }

  /**
   * @return Block specific instructions
   */
  scopeBlock(): BlockInstructions {
    return (this.cloneWithStyle(this.scope("this"), DefaultInstructions.blockInstructions));
  }

  scopeTerminal(name?: string): TerminalInstructions {
    return (this.cloneWithStyle(this.scope(name), DefaultInstructions.terminalInstructions));
  }

  /**
   * When cloning the generator instructions the "style"-properties need to
   * be merged carefully. A simple `assign` would not do a deep merge, so we
   * need to take care of that manually.
   *
   * @param current The instructions that need to be extended with the default
   *                values.
   * @param def Default values that **must** speficy a style.
   */
  private cloneWithStyle<T extends Pick<Instructions, "style">>(current: Partial<Instructions>, def: T) {
    const mergedStyle = Object.assign({}, def.style, current.style);
    // *Exactly* the merged style comes last to overwrite the styles
    // that have been incorrectly assigned before.
    return (Object.assign({}, def, current, { style: mergedStyle }));
  }

  /**
   * @return Instructions for the given scope
   */
  private scope(s?: string): Partial<Instructions> {
    return (this._all.scope(this._grammarName, this._typeName, s));
  }
}


/**
 * Maps terminal symbols to constant blocks. The exact value of the terminal
 * symbol will appear as the text.
 */
function mapTerminal(
  attr: NodeTerminalSymbolDescription,
  instructions: TerminalInstructions
): VisualBlockDescriptions.EditorConstant {
  const toReturn: VisualBlockDescriptions.EditorConstant = {
    blockType: "constant",
    text: attr.symbol,
  };

  if (Object.keys(instructions.style).length > 0) {
    toReturn.style = instructions.style;
  }

  return (toReturn);
}

/**
 * Maps properties to editable input fields.
 */
function mapProperty(attr: NodePropertyTypeDescription): VisualBlockDescriptions.EditorInput {
  return ({
    blockType: "input",
    property: attr.name
  });
};

/**
 *
 */
function mapChildren(
  attr: NodeChildrenGroupDescription,
  instructions: LayoutInstructions
): VisualBlockDescriptions.EditorIterator {
  let between: VisualBlockDescriptions.ConcreteBlock[] = undefined;
  if (typeof instructions.between === "string" && instructions.between.length > 0) {
    between = [mapTerminal({ type: "terminal", symbol: instructions.between }, DefaultInstructions.terminalInstructions)];
  }

  const toReturn: VisualBlockDescriptions.EditorIterator = {
    blockType: "iterator",
    childGroupName: attr.name,
    direction: instructions.orientation,
  }

  if (between) {
    toReturn.between = between;
  }

  return (toReturn);
}

/**
 * Applies the given generation instructions to each attribute
 * of the given type.
 */
function mapAttributes(
  typeDesc: NodeConcreteTypeDescription,
  instructions: SafeTypeInstructions,
): VisualBlockDescriptions.ConcreteBlock[] {
  return (
    typeDesc.attributes
      .map(attr => {
        switch (attr.type) {
          case "allowed":
          case "sequence":
          case "choice":
            return mapChildren(attr, instructions.scopeLayout(attr.name));
          case "terminal":
            return mapTerminal(attr, instructions.scopeTerminal(attr.name));
          case "property":
            return mapProperty(attr);
          default:
            return (undefined);
        }
      })
      .filter(visual => !!visual)
  );
}

/**
 * Concrete types are mapped to draggable blocks.
 */
function mapType(
  typeDesc: NodeConcreteTypeDescription,
  instructions: SafeTypeInstructions,
): VisualBlockDescriptions.EditorBlock {
  // Create a 
  return ({
    blockType: "block",
    direction: instructions.scopeBlock().orientation,
    children: mapAttributes(typeDesc, instructions)
  });
}

/**
 * Takes a grammar description and a description how to transform it and
 * generates the corresponding block language.
 */
export function convertGrammar(
  d: BlockLanguageGeneratorDocument,
  g: GrammarDescription
): BlockLanguageDocument {
  // Some information is provided 1:1 by the generation instructions,
  // these can be copied over without further ado. And some properties
  // are not filled by the generator on purpose:
  // 
  // * The `id` of the new language
  // * The default programming language
  const toReturn: BlockLanguageDocument = {
    editorBlocks: [],
    editorComponents: d.editorComponents,
    sidebars: []
  };

  // The blocks of the editor are based on the types of the grammar,
  // "oneOf" types are not of interest here because they can never
  // be nodes.
  const concreteTypes = Object.entries(g.types)
    .filter(([k, v]) => v.type !== "oneOf") as [string, NodeConcreteTypeDescription][];

  // Wrap generation instructions in something that is safe to use
  const instructions = new SafeGeneratorInstructions(d.typeInstructions);

  // Dummy mode on: Lets create a single constant block for every type
  toReturn.editorBlocks = concreteTypes.map(([tName, tDesc]): EditorBlockDescription => {
    return ({
      describedType: {
        languageName: g.name,
        typeName: tName
      },
      visual: [mapType(tDesc, instructions.type(g.name, tName))]
    });
  });

  return (toReturn);
}

/**
 * Takes a whole block language and overwrites document properties that can
 * be re-generated by automatic conversion.
 */
export function generateBlockLanguage(
  l: BlockLanguageListDescription,
  d: BlockLanguageGeneratorDescription,
  g: GrammarDescription
): BlockLanguageDescription {
  const generated = convertGrammar(d, g);

  const toReturn = Object.assign({}, l, generated);
  toReturn.blockLanguageGeneratorId = d.id;

  return (toReturn);
}
