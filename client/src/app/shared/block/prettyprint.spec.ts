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
  let expected = require(`raw-loader!./spec/${fileName}.txt`).default as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(transform(input)).toEqual(expected);
}

describe('BlockLanguage PrettyPrinter', () => {
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

  it('012 Block: Styled constant', () => {
    verifyFiles('012-block-constant-style', prettyPrintBlockLanguage);
  });

  it('013 Block: Iterator Empty Drop Target', () => {
    verifyFiles('013-block-iterator-empty-drop-target', prettyPrintBlockLanguage);
  });

  it('014 Container: Two constants', () => {
    verifyFiles('014-container-constants', prettyPrintBlockLanguage);
  });
});
