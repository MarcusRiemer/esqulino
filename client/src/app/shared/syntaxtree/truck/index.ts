import { LanguageDefinition } from '../language'

import { WORLD_NODE_CONVERTER } from './truck-world.codegenerator'

export const WORLD_LANGUAGE_DESCRIPTION: LanguageDefinition = {
  id: "truck-world",
  name: "Truck World",
  emitters: WORLD_NODE_CONVERTER,
  validators: []
}

export const PROG_LANGUAGE_DESCRIPTION: LanguageDefinition = {
  id: "truck-lang",
  name: "Truck Programming Language",
  emitters: [],
  validators: []
}
