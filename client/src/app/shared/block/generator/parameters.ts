import * as Desc from "./parameters.description";
import {
  isParameterReference,
  ParameterReference,
} from "./parameters.description";
import {
  AllTypeInstructions,
  Instructions,
  AllReferenceableTypeInstructions,
  ReferenceableInstructions,
  TypeInstructionsDescription,
  ReferenceableTypeInstructionsDescription,
} from "./instructions.description";
import { GeneratorError } from "./error.description";

// Function with this signature may be used
export type ValidationFunction = (
  expectedType: Desc.ParameterType,
  value: Desc.ParameterValue
) => boolean;

export const ValidatorFunctions: { [name: string]: ValidationFunction } = {
  string: (_expectedType, _value) => {
    return true;
  },
  boolean: (_expectedType, _value) => {
    return true;
  },
};

/**
 * Finds all references in the given object and its children.
 */
export function* allReferences(values: any): Iterable<ParameterReference> {
  if (typeof values === "object" && !!values) {
    if (isParameterReference(values)) {
      yield values;
    } else {
      for (let sub of Object.values(values)) {
        yield* allReferences(sub);
      }
    }
  }
}

/**
 * Controls parameter state by receiving declarations and values. Additionally
 * may resolve parameters according to the given state.
 */
export class ParameterMap {
  // All parameters that would be meaningful in this context
  private _knownParameters: Desc.ParameterDeclarations = {};

  // All values that are currently stored
  private _currentValues: { [name: string]: Desc.ParameterValue } = {};

  /**
   * Make the given parameters known to this map.
   */
  addParameters(params: Desc.ParameterDeclarations) {
    Object.entries(params).forEach(([name, param]) => {
      // Is this a parametername that has already been taken?
      const existing = this._knownParameters[name];
      if (existing) {
        // TODO: Instead of throwing an error directly one could possibly check
        // whether the re-declaration actually differs.
        throw new Error(
          `Parameter "${name}" has been declared before: ${JSON.stringify(
            existing
          )}`
        );
      } else {
        // Newly introduced, lets store a copy of it
        this._knownParameters[name] = Object.assign({}, param);
      }
    });
  }

  /**
   * Make additional values known
   */
  addValues(values: Desc.ParameterValues) {
    this._currentValues = Object.assign(this._currentValues, values);
  }

  /**
   * Check whether the given instructions could be meaningfully resolved.
   */
  validate(instructions: AllReferenceableTypeInstructions): GeneratorError[] {
    const toReturn: GeneratorError[] = [];

    // Go through every parameter to ensure its satisfied
    Object.entries(this._knownParameters).forEach(([name, param]) => {
      // Is there a value for this parameter?
      if (!(name in this._currentValues) && !("defaultValue" in param)) {
        // No, that is a problem
        toReturn.push({
          type: "ParameterMissingValue",
          name: name,
        });
      } else {
        // Yes, lets see whether it is valid
        const value = this._currentValues[name];
        // TODO: Yeah, lets see this!
      }
    });

    // Go through every provided value to ensure there is a corresponding parameter
    Object.entries(this._currentValues).forEach(([name, _value]) => {
      if (!this._knownParameters[name]) {
        toReturn.push({
          type: "ValueForUnknownParameter",
          name: name,
        });
      }
    });

    // Check every value that should be resolved
    Array.from(allReferences(instructions)).forEach((ref) => {
      ref;
      if (!(ref.$ref in this._knownParameters)) {
        toReturn.push({
          type: "ReferenceToUnknownParameter",
          name: ref.$ref,
        });
      }
    });

    return toReturn;
  }

  /**
   * Takes instructions that may have parameters and resolves all of those
   * parameters.
   */
  resolve(instructions: AllReferenceableTypeInstructions): AllTypeInstructions {
    const toReturn: AllTypeInstructions = {};

    Object.entries(instructions || {}).forEach(([grammarName, types]) => {
      const currentGrammar = {};
      toReturn[grammarName] = currentGrammar;
      Object.entries(types).forEach(([typeName, typeInstructions]) => {
        currentGrammar[typeName] = this.resolveTypeInstructions(
          typeInstructions
        );
      });
    });

    return toReturn;
  }

  /**
   * Resolves attributes of type that may generate one or multiple blocks.
   */
  private resolveTypeInstructions(
    referenceable: ReferenceableTypeInstructionsDescription
  ): TypeInstructionsDescription {
    const singleBlock: TypeInstructionsDescription = {};

    if (referenceable.attributes) {
      singleBlock.attributes = this.mapAttributes(referenceable.attributes);
    }

    if (referenceable.blocks) {
      singleBlock.blocks = referenceable.blocks.map((b) =>
        this.resolveInstructions(b)
      );
    }

    return singleBlock;
  }

  /**
   * Mapping the attributes that are present.
   */
  private mapAttributes(referenceable: {
    [type: string]: Partial<ReferenceableInstructions>;
  }): { [type: string]: Partial<Instructions> } {
    const toReturn: { [type: string]: Partial<Instructions> } = {};

    Object.entries(referenceable).forEach(([attributeName, instructions]) => {
      toReturn[attributeName] = this.resolveInstructions(instructions);
    });

    return toReturn;
  }

  /**
   * This is the only function that actually does something interesting.
   * If the given instructions contain any references, these are resolved.
   */
  private resolveInstructions(
    referenceable: Partial<ReferenceableInstructions>
  ): Partial<Instructions> {
    const toReturn: Partial<Instructions> = {};
    Object.entries(referenceable).forEach(([name, value]) => {
      if (isParameterReference(value)) {
        // Resolve the value
        toReturn[name] = this.getValue(value["$ref"]);
      } else if (value instanceof Object) {
        // We have a reference type that needs to be deep copied
        toReturn[name] = JSON.parse(JSON.stringify(value));
      } else {
        // We have a primitive type that may simply be copied
        toReturn[name] = value;
      }
    });

    // Style attributes are a more complicated matter and require separate intervention
    if (toReturn.style) {
      // Style values may warrant own replacements
      Object.entries(toReturn.style).forEach(([key, value]) => {
        if (isParameterReference(value)) {
          toReturn.style[key] = this.getValue(value["$ref"]);
        }
      });
    }

    return toReturn;
  }

  /**
   * @return The value that is saved under the given name.
   */
  getValue(name: string): any {
    let toReturn = undefined;
    if (name in this._currentValues) {
      toReturn = this._currentValues[name];
    } else if (
      this._knownParameters[name] &&
      "defaultValue" in this._knownParameters[name]
    ) {
      toReturn = this._knownParameters[name].defaultValue;
    } else {
      throw new Error(`Value "${name}" not known in paramMap`);
    }

    return toReturn;
  }
}
