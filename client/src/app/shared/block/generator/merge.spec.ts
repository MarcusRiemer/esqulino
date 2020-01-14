import { mergeTypeInstructions } from './merge'

describe(`Merging TypeInstructions`, () => {
  it(`Both sides empty`, () => {
    expect(mergeTypeInstructions({}, {})).toEqual({});
  });

  it(`Unrelated grammars`, () => {
    expect(mergeTypeInstructions(
      { "g1": {} },
      { "g2": {} }
    )).toEqual({
      "g1": {},
      "g2": {},
    });
  });

  it(`Related grammars with unrelated types`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": {} } },
      { "g1": { "t2": {} } }
    )).toEqual({
      "g1": { "t1": {}, "t2": {} },
    });
  });

  it(`Unrelated attributes`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { attributes: { "a1": { between: "1" } } } } },
      { "g1": { "t1": { attributes: { "a2": { between: "2" } } } } }
    )).toEqual({
      "g1": { "t1": { attributes: { "a1": { between: "1" }, "a2": { between: "2" } } }, },
    });
  });

  it(`Clashing attributes`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { attributes: { "a1": { between: "1" } } } } },
      { "g1": { "t1": { attributes: { "a1": { between: "2" } } } } }
    )).toEqual({
      "g1": { "t1": { attributes: { "a1": { between: "2" } } }, },
    });
  });

  it(`Clashing and unrelated attributes`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { attributes: { "a1": { between: "1", "propReadOnly": true } } } } },
      { "g1": { "t1": { attributes: { "a1": { between: "2", "generateErrorIndicator": "start" } } } } }
    )).toEqual({
      "g1": { "t1": { attributes: { "a1": { between: "2", "propReadOnly": true, "generateErrorIndicator": "start" } } }, },
    });
  });

  it(`Clashing styles`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { attributes: { "a1": { style: { "a": "1" } } } } } },
      { "g1": { "t1": { attributes: { "a1": { style: { "a": "2" } } } } } },
    )).toEqual({
      "g1": { "t1": { attributes: { "a1": { style: { "a": "2" } } } }, },
    });
  });

  it(`Unrelated styles`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { attributes: { "a1": { style: { "a": "1" } } } } } },
      { "g1": { "t1": { attributes: { "a1": { style: { "b": "2" } } } } } },
    )).toEqual({
      "g1": { "t1": { attributes: { "a1": { style: { "a": "1", "b": "2" } } } }, },
    });
  });

  it(`Merging blocks, first empty`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { blocks: [{}, {}] } } },
      { "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] } } }
    )).toEqual({
      "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] }, },
    });
  });

  it(`Merging blocks, second empty`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] } } },
      { "g1": { "t1": { blocks: [{}, {}] } } }
    )).toEqual({
      "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] }, },
    });
  });

  it(`Merging blocks, same value`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] } } },
      { "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] } } }
    )).toEqual({
      "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] }, },
    });
  });

  it(`Merging blocks, differing value`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] } } },
      { "g1": { "t1": { blocks: [{ "generateErrorIndicator": "end" }, {}] } } }
    )).toEqual({
      "g1": { "t1": { blocks: [{ "generateErrorIndicator": "end" }, {}] }, },
    });
  });

  it(`Merging blocks, different length (first empty)`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { blocks: [] } } },
      { "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] } } }
    )).toEqual({
      "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] }, },
    });
  });

  it(`Merging blocks, different length (second empty)`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] } } },
      { "g1": { "t1": { blocks: [] } } }
    )).toEqual({
      "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] }, },
    });
  });

  it(`Merging blocks, same length but differing indices`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, {}] } } },
      { "g1": { "t1": { blocks: [{}, { "generateErrorIndicator": "start" }] } } }
    )).toEqual({
      "g1": { "t1": { blocks: [{ "generateErrorIndicator": "start" }, { "generateErrorIndicator": "start" }] }, },
    });
  });
});
