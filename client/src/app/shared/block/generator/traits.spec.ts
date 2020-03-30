import { ScopeTraitAdd, ReferenceableTraits } from "./traits.description";
import { TraitMap } from "./traits";
import { AllReferenceableTypeInstructions } from "./instructions.description";

/**
 * Introduces a new trait that precisely sets `style.color`.
 */
function traitColor(
  { name = "keyword", color = "blue" }: { name?: string; color?: string } = {
    name: "keyword",
    color: "blue",
  }
): ReferenceableTraits {
  const toReturn: ReferenceableTraits = {};
  toReturn[name] = {
    instructions: {
      style: {
        color: color,
      },
    },
    applyMode: "deepMerge",
  };

  return toReturn;
}

function scope_g1t1(
  {
    traitName = "keyword",
    attr = ["a1"],
  }: { traitName?: string; attr?: string[] } = {
    traitName: "keyword",
    attr: ["a1"],
  }
): ScopeTraitAdd[] {
  return [
    {
      traits: [traitName],
      attributes: {
        g1: {
          t1: attr,
        },
      },
    },
  ];
}

describe("Traits", () => {
  it("Apply a single trait to an existing attribute", () => {
    const m = new TraitMap();
    m.addKnownTraits(traitColor());
    m.addScopes(scope_g1t1({}));

    const instructions: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {
            a1: {},
          },
        },
      },
    };

    const res = m.applyTraits(instructions);

    expect(res).not.toEqual(instructions);
    expect(res["g1"]["t1"].attributes["a1"].style["color"]).toEqual("blue");
  });

  it("Apply a two traits with a conflicting value", () => {
    const m = new TraitMap();

    // Add two traits that want to style g1.t1.a1.style.color
    m.addKnownTraits(traitColor({ name: "k1", color: "blue" }));
    m.addKnownTraits(traitColor({ name: "k2", color: "orange" }));
    m.addScopes(scope_g1t1({ attr: ["a1"], traitName: "k1" }));
    m.addScopes(scope_g1t1({ attr: ["a1"], traitName: "k2" }));

    const instructions: AllReferenceableTypeInstructions = {};

    const res = m.applyTraits(instructions);

    expect(res).not.toEqual(instructions);
    expect(res["g1"]["t1"].attributes["a1"].style["color"]).toEqual("orange");
  });

  it("Apply a two traits with a conflicting value but original value has precedence", () => {
    const m = new TraitMap();

    // Add two traits that want to style g1.t1.a1.style.color
    m.addKnownTraits(traitColor({ name: "k1", color: "blue" }));
    m.addKnownTraits(traitColor({ name: "k2", color: "orange" }));
    m.addScopes(scope_g1t1({ attr: ["a1"], traitName: "k1" }));
    m.addScopes(scope_g1t1({ attr: ["a1"], traitName: "k2" }));

    const instructions: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {
            a1: {
              style: {
                color: "fuchsia",
              },
            },
          },
        },
      },
    };

    const res = m.applyTraits(instructions);

    expect(res).toEqual(instructions);
  });

  it("Apply a single trait two existing attributes on the same type", () => {
    const m = new TraitMap();
    m.addKnownTraits(traitColor());
    m.addScopes(scope_g1t1({ attr: ["a1", "a2"] }));

    const instructions: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {
            a1: {},
            a2: {},
          },
        },
      },
    };

    const res = m.applyTraits(instructions);

    expect(res).not.toEqual(instructions);
    expect(res["g1"]["t1"].attributes["a1"].style["color"]).toEqual("blue");
    expect(res["g1"]["t1"].attributes["a2"].style["color"]).toEqual("blue");
  });

  it("Apply traits on non-existant grammar", () => {
    const m = new TraitMap();
    m.addKnownTraits(traitColor());
    m.addScopes(scope_g1t1({ attr: ["a1", "a2"] }));

    const instructions: AllReferenceableTypeInstructions = {};

    const res = m.applyTraits(instructions);

    expect(res).not.toEqual(instructions);
    expect(res["g1"]["t1"].attributes["a1"].style["color"]).toEqual("blue");
    expect(res["g1"]["t1"].attributes["a2"].style["color"]).toEqual("blue");
  });

  it("Apply traits on non-existant type", () => {
    const m = new TraitMap();
    m.addKnownTraits(traitColor());
    m.addScopes(scope_g1t1({ attr: ["a1", "a2"] }));

    const instructions: AllReferenceableTypeInstructions = {
      g1: {},
    };

    const res = m.applyTraits(instructions);

    expect(res).not.toEqual(instructions);
    expect(res["g1"]["t1"].attributes["a1"].style["color"]).toEqual("blue");
    expect(res["g1"]["t1"].attributes["a2"].style["color"]).toEqual("blue");
  });

  it("Apply traits on non-existant attribute", () => {
    const m = new TraitMap();
    m.addKnownTraits(traitColor());
    m.addScopes(scope_g1t1({ attr: ["a1", "a2"] }));

    const instructions: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {},
        },
      },
    };

    const res = m.applyTraits(instructions);

    expect(res).not.toEqual(instructions);
    expect(res["g1"]["t1"].attributes["a1"].style["color"]).toEqual("blue");
    expect(res["g1"]["t1"].attributes["a2"].style["color"]).toEqual("blue");
  });

  it("Apply traits on existing block #0", () => {
    const toAdd: ScopeTraitAdd = {
      traits: ["keyword"],
      blocks: {
        g1: { t1: [0] },
      },
    };

    const m = new TraitMap();
    m.addKnownTraits(traitColor());
    m.addScopes([toAdd]);

    const instructions: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          blocks: [{ style: { width: "20px" } }],
        },
      },
    };

    const res = m.applyTraits(instructions);

    expect(res).not.toEqual(instructions);
    expect(res["g1"]["t1"].blocks[0].style).toEqual({
      color: "blue",
      width: "20px",
    });
  });

  it("Apply traits on non-existant block #0", () => {
    const toAdd: ScopeTraitAdd = {
      traits: ["keyword"],
      blocks: {
        g1: { t1: [0] },
      },
    };

    const m = new TraitMap();
    m.addKnownTraits(traitColor());
    m.addScopes([toAdd]);

    const instructions: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {},
        },
      },
    };

    const res = m.applyTraits(instructions);

    expect(res).not.toEqual(instructions);
    expect(res["g1"]["t1"].blocks[0].style["color"]).toEqual("blue");
  });

  it("Apply traits on non-existant block #1", () => {
    const toAdd: ScopeTraitAdd = {
      traits: ["keyword"],
      blocks: {
        g1: {
          t1: [1],
        },
      },
    };

    const m = new TraitMap();
    m.addKnownTraits(traitColor());
    m.addScopes([toAdd]);

    const instructions: AllReferenceableTypeInstructions = {
      g1: {
        t1: {
          attributes: {},
        },
      },
    };

    const res = m.applyTraits(instructions);

    expect(res).not.toEqual(instructions);
    expect(res["g1"]["t1"].blocks[0]).toEqual({});
    expect(res["g1"]["t1"].blocks[1].style["color"]).toEqual("blue");
  });
});
