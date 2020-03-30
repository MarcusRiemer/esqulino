import {
  AllTypeInstructions,
  Instructions,
  IteratorInstructions,
  BlockInstructions,
  TerminalInstructions,
  DefaultInstructions,
  PropertyInstructions,
  TypeInstructionsDescription,
} from "./instructions.description";

import { NodeConcreteTypeDescription } from "../../syntaxtree";

/**
 * A safe way to access generation instructions. Silently returns empty
 * instructions for all paths without specific instructions.
 */
export class GeneratorInstructions {
  constructor(private _all: AllTypeInstructions) {
    // Ensure that at least an empty object is avaiable
    if (!this._all) {
      this._all = {};
    }
  }

  /**
   * The type-level is where most of the action happens. This method provides sort of
   * el-cheapo late binding: The grammar and type are remembered for later invocations.
   *
   * If the desired type instructions do not exist, purely default
   * SingleBlockInstructions are returned. This means that every block that has no
   * specific instructions will fall back to a single block.
   */
  typeInstructions(grammarName: string, typeName: string) {
    let gi = grammarName && this._all[grammarName];
    if (!gi) {
      return DEFAULT_INSTRUCTIONS;
    }

    let ti = typeName && gi[typeName];
    if (!ti) {
      return DEFAULT_INSTRUCTIONS;
    }

    return new TypeInstructions(ti);
  }
}

/**
 * A safe way to access generation instructions that are part of a specific block.
 * Returned instructions include default properties if no specific properties
 * have been set.
 */
export class TypeInstructions {
  constructor(private _type: TypeInstructionsDescription) {
    // If no valid instructions are passed in: Assume there are no special
    // instructions for any attribute
    if (!this._type) {
      this._type = {
        attributes: {},
      };
    }

    // If no block is specified a single default block is assumed
    if (!this._type.blocks) {
      this._type.blocks = [{}];
    }
  }

  get numberOfBlocks() {
    return this._type.blocks.length;
  }

  /**
   * The types for that specific instructions exist.
   */
  relevantAttributes(i: number, typeDesc: NodeConcreteTypeDescription) {
    const block = this._type.blocks[i];
    const order = block && block.attributeMapping;
    if (!order || order === "grammar") {
      // Hand out the attributes as ordered in the grammar
      return (typeDesc.attributes || []).map((a) => a.name);
    } else {
      // Hand out the attributes as they have been defined
      return order;
    }
  }

  /**
   * @return Layout specific instructions.
   */
  scopeIterator(s: string): IteratorInstructions {
    return this.cloneWithStyle(
      this.scope(s),
      DefaultInstructions.iteratorInstructions
    );
  }

  /**
   * @return Block specific instructions
   */
  scopeBlock(i: number): BlockInstructions {
    return this.cloneWithStyle(
      this._type.blocks[i] || {},
      DefaultInstructions.blockInstructions
    );
  }

  /**
   * @return Terminal specific instructions.
   */
  scopeTerminal(name?: string): TerminalInstructions {
    return this.cloneWithStyle(
      this.scope(name),
      DefaultInstructions.terminalInstructions
    );
  }

  /**
   * @return Property specific instructions.
   */
  scopeProperty(name?: string): PropertyInstructions {
    return this.cloneWithStyle(
      this.scope(name),
      DefaultInstructions.propertyInstructions
    );
  }

  /**
   * @return Exact instructions for the given scope, no default values applied.
   */
  scope(s?: string): Partial<Instructions> {
    let toReturn = this._type.attributes && this._type.attributes[s];
    if (!toReturn) {
      toReturn = {};
    }

    return toReturn;
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
  private cloneWithStyle<T extends Pick<Instructions, "style">>(
    current: Partial<Instructions>,
    def: T
  ) {
    const mergedStyle = Object.assign({}, def.style, current.style);
    // *Exactly* the merged style comes last to overwrite the styles
    // that have been incorrectly assigned before.
    return Object.assign({}, def, current, { style: mergedStyle });
  }
}

// These instructions are used when no specific instructions are available
export const DEFAULT_INSTRUCTIONS = new TypeInstructions(undefined);
