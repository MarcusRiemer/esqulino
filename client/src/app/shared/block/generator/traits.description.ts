import { Instructions, ReferenceableInstructions } from './instructions.description';

export interface ScopeTraitAddSpecific {
  "type": "specific",
  "grammar": {
    // Name of the grammar
    [grammar: string]: {
      blocks?: string[]
      attributes?: {
        [type: string]: string[]
      }
    }
  }
}

// Allows traits to be added from afar
export interface ScopeTraitAdd {
  // The names of the traits that should be added
  traits: string[];
  // The attributes these traits should be added to
  attributes?: {
    [grammar: string]: {
      [type: string]: string[]
    }
  }
  // The blocks these traits should be added to
  blocks?: {
    [grammar: string]: {
      [type: string]: number[]
    }
  }
}

/**
 *
 */
interface InternalTrait<T extends ReferenceableInstructions> {
  instructions: Partial<T>;
  applyMode: "shallowMerge" | "deepMerge" | "replace"
}

interface InternalTraits<T extends ReferenceableInstructions> {
  [name: string]: InternalTrait<T>
}

export type ResolvedTrait = InternalTrait<Instructions>;
export type ResolvedTraits = InternalTraits<Instructions>;

export type ReferenceableTrait = InternalTrait<ReferenceableInstructions>;
export type ReferenceableTraits = InternalTraits<ReferenceableInstructions>;


