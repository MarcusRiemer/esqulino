import { Parameter, ParameterDefinition } from './parameter'

/**
 * Allows the user to input strings.
 */
export class StringParameter extends Parameter {
  constructor(def: ParameterDefinition) {
    super(def);
  }
}
