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
      { "g1": { "t1": { attributes: { "a1": { between: "1", "readOnly": true } } } } },
      { "g1": { "t1": { attributes: { "a1": { between: "2", "orientation": "vertical" } } } } }
    )).toEqual({
      "g1": { "t1": { attributes: { "a1": { between: "2", "readOnly": true, "orientation": "vertical" } } }, },
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

  it(`Differing blocks`, () => {
    expect(mergeTypeInstructions(
      { "g1": { "t1": { blocks: [{ orientation: "horizontal" }, {}] } } },
      { "g1": { "t1": { blocks: [{}, {}] } } }
    )).toEqual({
      "g1": { "t1": { blocks: [{}, {}] }, },
    });
  });
});
