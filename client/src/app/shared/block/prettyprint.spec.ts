import { LanguageModelDescription } from './language-model.description'
import { VisualBlockDescriptions, EditorBlockDescription } from './block.description'

import { prettyPrintLanguageModel } from './prettyprint'

/**
 * Ensures that the given in and output files do match correctly.
 *
 * This function can not be exported from a different module because the calls
 * to `require` are relative to the file the function is defined in.
 * So for the moment this function is copy and pasted into some spec files :(
 */
export function verifyFiles<T>(fileName: string, transform: (obj: T) => string) {
  const input = require(`json-loader!./spec/${fileName}.json`);
  let expected = require(`raw-loader!./spec/${fileName}.txt`) as string;

  if (expected.endsWith("\n")) {
    expected = expected.substr(0, expected.length - 1);
  }

  expect(transform(input)).toEqual(expected);
}

describe('LanguageModel PrettyPrinter', () => {
  it('Scratch', () => {
    const l: LanguageModelDescription = {
      "id": "test",
      "name": "test",
      "editorBlocks": [
        {
          "describedType": {
            "languageName": "test",
            "typeName": "root"
          },
          "visual": [
            {
              "blockType": "block",
              "direction": "horizontal",
              "children": [

              ]
            }
          ]
        }
      ],
      "sidebarBlocks": []
    };
  });

  it('01 Empty Language', () => {
    verifyFiles('01-lang-empty', prettyPrintLanguageModel);
  });

  it('02 Block: Single Constant', () => {
    verifyFiles('02-block-single-constant', prettyPrintLanguageModel);
  });

  it('03 Block: Single Interpolated', () => {
    verifyFiles('03-block-single-interpolated', prettyPrintLanguageModel);
  });

  it('04 Block: Mixing constants and interpolation', () => {
    verifyFiles('04-block-mix-constant-interpolated', prettyPrintLanguageModel);
  });

  it('05 Block: Iterator', () => {
    verifyFiles('05-block-iterator', prettyPrintLanguageModel);
  });

  it('06 Block: Iterator with between', () => {
    verifyFiles('06-block-iterator-between', prettyPrintLanguageModel);
  });

  it('07 Block: Drop Target with constant', () => {
    verifyFiles('07-block-drop-target-constant', prettyPrintLanguageModel);
  });

  it('08 Block: Drop Target with constant', () => {
    verifyFiles('08-block-drop-target-multi-visible', prettyPrintLanguageModel);
  });

  it('09 Block: empty', () => {
    verifyFiles('09-block-empty', prettyPrintLanguageModel);
  });

  it('10 Sidebar: Empty Node', () => {
    verifyFiles('10-sidebar-empty-node', prettyPrintLanguageModel);
  });
});
