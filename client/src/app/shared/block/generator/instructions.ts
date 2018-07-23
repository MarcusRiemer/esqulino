import {
  AllTypeInstructions, Instructions, IteratorInstructions, BlockInstructions,
  TerminalInstructions, DefaultInstructions, TypeInstructions, isMultiBlockInstructions,
  SingleBlockInstructionsDescription, MultiBlockInstructionsDescription, PropertyInstructions
} from './instructions.description'
import { NodeConcreteTypeDescription } from '../../syntaxtree';

/**
 * A safe way to access generation instructions. Silently returns empty
 * instructions for all paths without specific instructions.
 */
export class GeneratorInstructions {
  constructor(
    private _all: AllTypeInstructions
  ) {
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
      return (DEFAULT_INSTRUCTIONS);
    }

    let ti = typeName && gi[typeName];
    if (!ti) {
      return (DEFAULT_INSTRUCTIONS);
    }

    if (isMultiBlockInstructions(ti)) {
      return (new MultiBlockInstructions(ti));
    } else {
      return (new SingleBlockInstructions(ti));
    }
  }
}

/**
 * Accessing descriptions for multiple blocks.
 */
export class MultiBlockInstructions {
  constructor(
    private _desc: MultiBlockInstructionsDescription
  ) { }

  readonly blocks: ReadonlyArray<SingleBlockInstructions> = this._desc.blocks.map(b => new SingleBlockInstructions(b));
}

/**
 * A safe way to access generation instructions that are part of a specific block. 
 * Returned instructions include default properties if no specific properties
 * have been set.
 */
export class SingleBlockInstructions {
  constructor(
    private _type: SingleBlockInstructionsDescription
  ) {
    // If no valid instructions are passed in: Assume a single block without any
    // special qualities
    if (!this._type) {
      this._type = {
        type: "single",
        attributes: {}
      };
    }
  }

  /**
   * The types for that specific instructions exist.
   */
  relevantAttributes(typeDesc: NodeConcreteTypeDescription) {
    const order = (this._type.block && this._type.block.attributeMapping);

    if (!order || order === "grammar") {
      return (typeDesc.attributes.map(a => a.name));
    } else {
      return (order);
    }
  }

  /**
   * @return Layout specific instructions.
   */
  scopeIterator(s: string): IteratorInstructions {
    return (this.cloneWithStyle(this.scope(s), DefaultInstructions.iteratorInstructions));
  }

  /**
   * @return Block specific instructions
   */
  scopeBlock(): BlockInstructions {
    return (this.cloneWithStyle(this._type.block || {}, DefaultInstructions.blockInstructions));
  }

  /**
   * @return Terminal specific instructions.
   */
  scopeTerminal(name?: string): TerminalInstructions {
    return (this.cloneWithStyle(this.scope(name), DefaultInstructions.terminalInstructions));
  }

  /**
   * @return Property specific instructions.
   */
  scopeProperty(name?: string): PropertyInstructions {
    return (this.cloneWithStyle(this.scope(name), DefaultInstructions.propertyInstructions));
  }

  /**
   * @return Exact instructions for the given scope, no default values applied.
   */
  scope(s?: string): Partial<Instructions> {
    let toReturn = this._type.attributes[s];
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
  private cloneWithStyle<T extends Pick<Instructions, "style">>(current: Partial<Instructions>, def: T) {
    const mergedStyle = Object.assign({}, def.style, current.style);
    // *Exactly* the merged style comes last to overwrite the styles
    // that have been incorrectly assigned before.
    return (Object.assign({}, def, current, { style: mergedStyle }));
  }
}

export const DEFAULT_INSTRUCTIONS = new SingleBlockInstructions(undefined);
