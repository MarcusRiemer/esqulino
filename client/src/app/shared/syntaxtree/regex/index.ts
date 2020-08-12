import { LanguageDefinition } from "../language";
import { REGEX_CONVERTER } from "./regex.codegenerator";
import { TESTBENCH_CONVERTER } from "./regex-testbench.codegenerator";
import { GRAMMAR_DESCRIPTION } from "./regex.grammar";

export const LANGUAGE_DESCRIPTION: LanguageDefinition = {
  id: "regex",
  name: "RegEx",
  emitters: REGEX_CONVERTER,
  validators: [GRAMMAR_DESCRIPTION],
};

export const TESTBENCH_DESCRIPTION: LanguageDefinition = {
  id: "regex-testbench",
  name: "RegEx TestBench",
  emitters: TESTBENCH_CONVERTER,
  validators: [],
};
