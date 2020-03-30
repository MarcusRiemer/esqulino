import { LanguageDefinition } from "../language";

import {
  NODE_CONVERTER_ERUBY,
  NODE_CONVERTER_LIQUID,
} from "./dxml.codegenerator";
import { GRAMMAR_DESCRIPTION } from "./dxml.grammar";

export const LANGUAGE_DESCRIPTION_LIQUID: LanguageDefinition = {
  id: "dxml-liquid",
  name: "Dynamic XML (Liquid)",
  emitters: NODE_CONVERTER_LIQUID,
  validators: [GRAMMAR_DESCRIPTION],
};

export const LANGUAGE_DESCRIPTION_ERUBY: LanguageDefinition = {
  id: "dxml-eruby",
  name: "Dynamic XML (eRuby)",
  emitters: NODE_CONVERTER_ERUBY,
  validators: [GRAMMAR_DESCRIPTION],
};
