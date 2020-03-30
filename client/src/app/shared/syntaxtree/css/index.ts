import { LanguageDefinition } from "../language";

import { NODE_CONVERTER } from "./css.codegenerator";
import { GRAMMAR_DESCRIPTION } from "./css.grammar";

export const LANGUAGE_DESCRIPTION: LanguageDefinition = {
  id: "css",
  name: "CSS",
  emitters: NODE_CONVERTER,
  validators: [GRAMMAR_DESCRIPTION],
};
