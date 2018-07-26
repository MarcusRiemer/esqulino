import { ScopeTraitAdd, ReferenceableTraits } from './traits.description'
import {
  AllReferenceableTypeInstructions, ReferenceableInstructions
} from './instructions.description';

/**
 * Collects traits which may be assigned to instructions.
 */
export class TraitMap {
  private _knownTraits: ReferenceableTraits = {};
  private _knownScopes: ScopeTraitAdd[] = [];

  /**
   * Makes the given instructions known under the given names. If a trait with the same
   * name exists, it is replaced.
   */
  public addKnownTraits(traits: ReferenceableTraits) {
    Object.assign(this._knownTraits, traits);
  }

  /**
   * Tell under which scopes the known traits should be applied.
   */
  public addScopes(scopes: ScopeTraitAdd[]) {
    this._knownScopes.push(...scopes);
  }

  /**
   * 
   */
  public applyTraits(instructions: AllReferenceableTypeInstructions) {
    instructions = JSON.parse(JSON.stringify(instructions)); // Don't mutate the input
    this._knownScopes.forEach(scope => {
      // Apply rules in this scope to all specified attributes
      Object.entries(scope.attributes || {}).forEach(([grammarName, types]) => {
        Object.entries(types || {}).forEach(([typeName, attributeNames]) => {
          (attributeNames || []).forEach(attributeName => {
            // Now we know which instructions we should manipulate
            const attributeInstructions = this.generatingInstructionAccess(
              instructions, grammarName, typeName, attributeName
            );
            // Apply all traits that have been given
            (scope.traits || []).forEach(trait => {
              this.applyTrait(trait, attributeInstructions);
            });
          });
        });
      });
      // Apply rules in this scope to all specified blocks
      Object.entries(scope.blocks || {}).forEach(([grammarName, types]) => {
        Object.entries(types || {}).forEach(([typeName, blockIndices]) => {
          (blockIndices || []).forEach(blockIndex => {
            // Now we know which blocks we should manipulate
            const blockInstructions = this.generatingBlockAccess(
              instructions, grammarName, typeName, blockIndex
            );
            // Apply all traits that have been given
            (scope.traits || []).forEach(trait => {
              this.applyTrait(trait, blockInstructions);
            });
          });
        });
      });
    });

    return (instructions);
  }

  /**
   * Retrieves the instructions for the specified attribute. If no instructions for that
   * attribute exist yet they are created on the fly.
   */
  private generatingInstructionAccess(obj: AllReferenceableTypeInstructions, g: string, t: string, a: string) {
    // No grammar? No problem!
    if (!(g in obj)) {
      obj[g] = {};
    }

    // Type missing in the grammar? Create a default type!
    if (!(t in obj[g])) {
      obj[g][t] = {};
    }

    // The "attributes" object is optional so it may no exist
    if (!("attributes" in obj[g][t])) {
      obj[g][t].attributes = {};
    }

    // And the instructions themselves may not exist yet
    if (!(a in obj[g][t].attributes)) {
      obj[g][t].attributes[a] = {};
    }

    // And now we can be sure that each of this levels has a valid value ...
    return (obj[g][t].attributes[a]);
  }

  /**
   * Retrieves the instructions for the specified bklock. If no instructions for that
   * block exist yet they are created on the fly.
   */
  private generatingBlockAccess(obj: AllReferenceableTypeInstructions, g: string, t: string, b: number) {
    // No grammar? No problem!
    if (!(g in obj)) {
      obj[g] = {};
    }

    // Type missing in the grammar? Create a default type!
    if (!(t in obj[g])) {
      obj[g][t] = {};
    }

    // The "blocks" array is optional so it may no exist
    if (!("blocks" in obj[g][t])) {
      obj[g][t].blocks = [];
    }

    // We need as many blocks as the index tells us to
    while (b >= obj[g][t].blocks.length) {
      obj[g][t].blocks.push({});
    }

    // And now we can be sure that each of this levels has a valid value ...
    return (obj[g][t].blocks[b]);
  }

  /**
   * Applies the instructions of the trait with the given name to the given instructions.
   */
  private applyTrait(traitName: string, instructions: Partial<ReferenceableInstructions>) {
    const traitInstructions = this._knownTraits[traitName];
    if (traitInstructions) {
      switch (traitInstructions.applyMode) {
        case "deepMerge":
          this.deepMergeInstructions(instructions, traitInstructions.instructions);
          break;
        case "replace":
          // Delete everything and then use a shallow merge (no break)
          Object.keys(instructions).forEach(prop => delete instructions[prop]);
        case "shallowMerge":
          this.shallowMerge(instructions, traitInstructions);
          break;
      }
    } else {
      throw new Error(`Unknown trait "${traitName}"`);
    }
  }

  /**
   * Recursively merges
   */
  private deepMergeInstructions(target: any, toMerge: any) {
    Object.entries(toMerge).forEach(([name, value]) => {
      const targetHasKey = name in target;

      if (Array.isArray(value)) {
        throw new Error("Array merging is currently not supported");
      } else if (value instanceof Object) {
        if (!targetHasKey) {
          target[name] = value;
        } else {
          this.deepMergeInstructions(target[name], value);
        }
      } else {
        target[name] = value;
      }
    });
  }

  private shallowMerge(target: any, toMerge: any) {
    Object.entries(toMerge || {}).forEach(([key, value]) => {
      if (!(key in target)) {
        target[key] = toMerge[key];
      }
    });
  }
}
