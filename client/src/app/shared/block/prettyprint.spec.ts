import { BlockLanguageDescription } from './block-language.description'
import { VisualBlockDescriptions, EditorBlockDescription } from './block.description'

import { prettyPrintBlockLanguage } from './prettyprint'

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into some spec files :(
 */
export function verifyFiles<T>(fileName: string, transform: (obj: T) => string) {
  const input = require(`./spec/${fileName}.json`);
  let expected = require(`raw-loader!./spec/${fileName}.txt`) as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(transform(input)).toEqual(expected);
}

describe('LanguageModel PrettyPrinter', () => {
  it('001 Empty Language', () => {
    verifyFiles('001-lang-empty', prettyPrintBlockLanguage);
  });

  it('002 Block: Single Constant', () => {
    verifyFiles('002-block-single-constant', prettyPrintBlockLanguage);
  });

  it('003 Block: Single Interpolated', () => {
    verifyFiles('003-block-single-interpolated', prettyPrintBlockLanguage);
  });

  it('004 Block: Mixing constants and interpolation', () => {
    verifyFiles('004-block-mix-constant-interpolated', prettyPrintBlockLanguage);
  });

  it('005 Block: Iterator', () => {
    verifyFiles('005-block-iterator', prettyPrintBlockLanguage);
  });

  it('006 Block: Iterator with between', () => {
    verifyFiles('006-block-iterator-between', prettyPrintBlockLanguage);
  });

  it('007 Block: Drop Target with constant', () => {
    verifyFiles('007-block-drop-target-constant', prettyPrintBlockLanguage);
  });

  it('008 Block: Drop Target with constant', () => {
    verifyFiles('008-block-drop-target-multi-visible', prettyPrintBlockLanguage);
  });

  it('009 Block: empty', () => {
    verifyFiles('009-block-empty', prettyPrintBlockLanguage);
  });

  it('010 Sidebar: Empty Node', () => {
    verifyFiles('010-sidebar-empty', prettyPrintBlockLanguage);
  });

  it('011 Sidebar: Single Category', () => {
    verifyFiles('011-sidebar-single-category', prettyPrintBlockLanguage);
  });

  it('012 Block: Drop child category', () => {
    verifyFiles('012-block-drop-child', prettyPrintBlockLanguage);
  });

  it('013 Block: Drop parent category', () => {
    verifyFiles('013-block-drop-parent', prettyPrintBlockLanguage);
  });

  it('014 Block: Drop self', () => {
    verifyFiles('014-block-drop-self', prettyPrintBlockLanguage);
  });

  it('015 Block: Styled constant', () => {
    verifyFiles('015-block-constant-style', prettyPrintBlockLanguage);
  });
});
