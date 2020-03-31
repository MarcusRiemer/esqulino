import { LanguageDefinition } from "../language";

import { NODE_CONVERTER } from "./regex.codegenerator";
import { GRAMMAR_DESCRIPTION } from "./regex.grammar";

export const LANGUAGE_DESCRIPTION: LanguageDefinition = {
  id: "regex",
  name: "RegEx",
  emitters: NODE_CONVERTER,
  validators: [GRAMMAR_DESCRIPTION],
};
