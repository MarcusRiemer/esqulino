import {
  TypeInstructions, Instructions, LayoutInstructions, BlockInstructions,
  TerminalInstructions, DefaultInstructions
} from './generator.description'

/**
 * A safe way to access generation instructions. Silently returns empty
 * instructions for all paths without specific instructions.
 */
export class SafeGeneratorInstructions {
  constructor(
    private _all: TypeInstructions
  ) {
    // Ensure that at least an empty object is avaiable
    if (!this._all) {
      this._all = {};
    }
  }

  /**
   * Retrieves the exact instructions at the given path.
   *
   * @param grammarName The name of the grammar
   * @param typeName The type that is requested
   * @param scope The exact scope that is requested
   */
  scope(grammarName?: string, typeName?: string, scope?: string): Partial<Instructions> {
    let gi = grammarName && this._all[grammarName];
    if (!gi) {
      return ({});
    }

    let ti = typeName && gi[typeName];
    if (!ti) {
      return ({});
    }

    let si = scope && ti[scope];
    if (!si) {
      return ({});
    }

    return si;
  }


  /**
   * The type-level is where most of the action happens. This method provides sort of
   * el-cheapo late binding: The grammar and type are remembered for later invocations.
   */
  type(grammarName: string, typeName: string) {
    return (new SafeTypeInstructions(this, grammarName, typeName));
  }
}

/**
 * A safe way to access generation instructions that are part of a specific type. 
 * Returned instructions include default properties if no specific properties
 * have been set.
 */
export class SafeTypeInstructions {
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

  /**
   * @return Terminal specific instructions.
   */
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
   * @return Exact instructions for the given scope, no default values applied.
   */
  private scope(s?: string): Partial<Instructions> {
    return (this._all.scope(this._grammarName, this._typeName, s));
  }
}
