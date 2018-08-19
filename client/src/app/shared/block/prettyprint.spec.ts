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
  it('01 Empty Language', () => {
    verifyFiles('01-lang-empty', prettyPrintBlockLanguage);
  });

  it('02 Block: Single Constant', () => {
    verifyFiles('02-block-single-constant', prettyPrintBlockLanguage);
  });

  it('03 Block: Single Interpolated', () => {
    verifyFiles('03-block-single-interpolated', prettyPrintBlockLanguage);
  });

  it('04 Block: Mixing constants and interpolation', () => {
    verifyFiles('04-block-mix-constant-interpolated', prettyPrintBlockLanguage);
  });

  it('05 Block: Iterator', () => {
    verifyFiles('05-block-iterator', prettyPrintBlockLanguage);
  });

  it('06 Block: Iterator with between', () => {
    verifyFiles('06-block-iterator-between', prettyPrintBlockLanguage);
  });

  it('07 Block: Drop Target with constant', () => {
    verifyFiles('07-block-drop-target-constant', prettyPrintBlockLanguage);
  });

  it('08 Block: Drop Target with constant', () => {
    verifyFiles('08-block-drop-target-multi-visible', prettyPrintBlockLanguage);
  });

  it('09 Block: empty', () => {
    verifyFiles('09-block-empty', prettyPrintBlockLanguage);
  });

  it('10 Sidebar: Empty Node', () => {
    verifyFiles('10-sidebar-empty', prettyPrintBlockLanguage);
  });

  it('11 Sidebar: Single Category', () => {
    verifyFiles('11-sidebar-single-category', prettyPrintBlockLanguage);
  });

  it('12 Block: Drop child category', () => {
    verifyFiles('12-block-drop-child', prettyPrintBlockLanguage);
  });

  it('13 Block: Drop parent category', () => {
    verifyFiles('13-block-drop-parent', prettyPrintBlockLanguage);
  });

  it('14 Block: Drop self', () => {
    verifyFiles('14-block-drop-self', prettyPrintBlockLanguage);
  });

  it('15 Block: Styled constant', () => {
    verifyFiles('15-block-constant-style', prettyPrintBlockLanguage);
  });
});
