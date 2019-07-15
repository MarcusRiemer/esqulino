import { LanguageDefinition } from '../language';

import { HTML_CONVERTER } from './html.codegenerator';

export const HTML_LANGUAGE_DESCRIPTION: LanguageDefinition = {
  id: "html",
  name: "HTML",
  emitters: HTML_CONVERTER,
  validators: []
}