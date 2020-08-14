import { LanguageDefinition } from "../language";

import { GRAMMAR_NODE_CONVERTER } from "./meta-grammar.codegenerator";

export const GRAMMAR_LANGUAGE_DESCRIPTION: LanguageDefinition = {
  id: "meta-grammar",
  name: "Meta Grammar",
  emitters: GRAMMAR_NODE_CONVERTER,
  validators: [],
};
