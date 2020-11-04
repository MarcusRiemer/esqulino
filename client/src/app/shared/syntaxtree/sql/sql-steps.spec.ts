import { stepwiseSqlQuery, SqlStepDescription } from "./sql-steps";
import { Tree, Node, NodeDescription } from "../syntaxtree";

function starSelectTest(stepDesc: SqlStepDescription) {
  const node = new Node(stepDesc.ast, undefined);
  expect(node.typeName).toEqual("querySelect");
  expect(node.getChildrenInCategory("select").length).toEqual(1);
  const selectNode = node.getChildInCategory("select");
  expect(selectNode.getChildrenInCategory("columns").length).toEqual(1);
  expect(selectNode.getChildInCategory("columns").typeName).toEqual(
    "starOperator"
  );
}

function testJoin(
  stepDesc: SqlStepDescription,
  desc: NodeDescription,
  childIndex: number,
  nodeTyp: string,
  filterName?: string
) {
  const node = new Node(stepDesc.ast, undefined);

  expect(node.childrenCategoryNames).toEqual(["select", "from"]);
  starSelectTest(stepDesc);

  const fromNode = node.getChildInCategory("from");
  expect(fromNode).toBeDefined();
  //expect(fromNode.childrenCategoryNames).toEqual(["tables", "joins"]);
  expect(fromNode.getChildInCategory("tables").toModel()).toEqual(
    desc.children.from[0].children.tables[0]
  );

  //join table
  expect(fromNode.getChildrenInCategory("joins").length).toEqual(
    childIndex + 1
  );
  const joinNode = fromNode.getChildrenInCategory("joins")[childIndex];
  // joinNode without on
  if (filterName) {
    expect(joinNode.childrenCategoryNames.sort()).toEqual(
      ["table", filterName].sort()
    );
  } else {
    expect(joinNode.childrenCategoryNames).toEqual(["table"]);
  }

  expect(joinNode.typeName).toEqual(nodeTyp);
  expect(joinNode.getChildrenInCategory("table").length).toEqual(1);
  expect(joinNode.getChildInCategory("table").toModel()).toEqual(
    desc.children.from[0].children.joins[childIndex].children.table[0]
  );
}

function testJoinFilter(
  stepDesc: SqlStepDescription,
  desc: NodeDescription,
  index: number,
  filter: string
) {
  const src = new Tree(desc);
  const node = new Node(stepDesc.ast, undefined);
  starSelectTest(stepDesc);

  expect(node.childrenCategoryNames).toEqual(["select", "from"]);

  const join = node.getChildInCategory("from").getChildrenInCategory("joins")[
    index
  ];
  expect(join.typeName).toEqual(
    "innerJoin" + filter.charAt(0).toUpperCase() + filter.slice(1)
  );

  const filterNode = join.getChildInCategory(filter);
  expect(filterNode.toModel()).toEqual(
    src
      .locate([
        ["from", 0],
        ["joins", index],
        [filter, 0],
      ])
      .toModel()
  );
}

describe(`SQL Steps`, () => {
  it(`Empty Tree`, () => {
    expect(stepwiseSqlQuery(undefined)).toEqual([]);
    //expect(() => stepwiseSqlQuery(undefined)).toThrowError(/Empty Tree/);
  });

  it("Basic select-from, not breaking down", () => {
    const desc: NodeDescription = require("./spec/ast-40-select-from.json");
    const steps = stepwiseSqlQuery(desc);
    const node = new Node(steps[0].ast, undefined);

    expect(steps.length).toEqual(1);

    starSelectTest(steps[0]);
    expect(node.toModel()).toEqual(desc);

    expect(steps[0].description).toEqual({
      type: "select",
      expressions: ["*"],
    });
  });
});

describe(`simple where filter`, () => {
  const desc: NodeDescription = require("./spec/ast-41-select-from-where.json");
  const steps = stepwiseSqlQuery(desc);

  it("first step", () => {
    expect(steps.length).toEqual(2);

    const node = new Node(steps[0].ast, undefined);
    expect(node.childrenCategoryNames).toEqual(["select", "from", "where"]);

    starSelectTest(steps[0]);

    expect(node.getChildInCategory("where").toModel()).toEqual(
      desc.children.where[0]
    );

    expect(steps[0].description).toEqual({
      type: "where",
      expressions: ["adresse.LKZ <> D"],
    });
  });

  //second step containing the fields from the select-clause and the where-clause
  it("second step", () => {
    const node = new Node(stepwiseSqlQuery(desc)[1].ast, undefined);
    expect(node.childrenCategoryNames).toEqual(["select", "from", "where"]);
    // fields from select should correspond to initial-query
    expect(node.getChildInCategory("select").toModel()).toEqual(
      desc.children.select[0]
    );

    //where should correspond to initial-query----- maybe redundant?
    expect(node.getChildInCategory("where").toModel()).toEqual(
      desc.children.where[0]
    );

    expect(steps[1].description).toEqual({
      type: "select",
      expressions: ["termin.TAG"],
    });
  });
});

describe("simple join", () => {
  const desc: NodeDescription = require("./spec/ast-42-simple-join.json");
  const steps = stepwiseSqlQuery(desc);

  it("1: cross join", () => {
    expect(steps.length).toEqual(3);
    testJoin(steps[0], desc, 0, "crossJoin");
    expect(steps[0].description).toEqual({
      type: "cross",
      tables: ["Charakter", "Auftritt"],
    });
  });

  it("2: on-clouse", () => {
    testJoinFilter(steps[1], desc, 0, "on");
    expect(steps[1].description).toEqual({
      type: "on",
      expressions: ["Auftritt.Charakter_ID = Charakter.Charakter_ID"],
    });
  });

  it("3: select-clause", () => {
    expect(steps[2].ast).toEqual(desc);
    expect(steps[2].description).toEqual({
      type: "select",
      expressions: ["Charakter.Charakter_Name"],
    });
  });
});

//  SELECT COUNT(Charakter.Charakter_Name)
//       FROM Charakter
// 	    INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
//     GROUP BY Charakter.Charakter_ID
//     ORDER BY COUNT() DESC, Charakter.Charakter_Name
describe("query with join,group,order", () => {
  const desc: NodeDescription = require("./spec/ast-43-join-group-order.json");
  const steps = stepwiseSqlQuery(desc);

  // SELECT *
  // FROM Charakter
  // INNER JOIN Auftritt
  it("1: cross join", () => {
    expect(steps.length).toEqual(5);
    testJoin(steps[0], desc, 0, "crossJoin");
    expect(steps[0].description).toEqual({
      type: "cross",
      tables: ["Charakter", "Auftritt"],
    });
  });

  //  SELECT *
  // FROM Charakter
  // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
  it("2: on-clouse", () => {
    testJoinFilter(steps[1], desc, 0, "on");
    expect(steps[1].description).toEqual({
      type: "on",
      expressions: ["Auftritt.Charakter_ID = Charakter.Charakter_ID"],
    });
  });

  // SELECT *
  //   FROM Charakter
  //   INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
  // GROUP BY Charakter.Charakter_ID
  it("3: groupBy-clouse", () => {
    expect(steps[2]).toBeDefined();
    const node = new Node(steps[2].ast, undefined);
    starSelectTest(steps[2]);
    expect(node.childrenCategoryNames).toEqual(["select", "from", "groupBy"]);
    expect(node.getChildInCategory("groupBy").toModel()).toEqual(
      desc.children.groupBy[0]
    );

    expect(steps[2].description).toEqual({
      type: "groupBy",
      expressions: ["Charakter.Charakter_ID"],
      groupByEntriesDescription: require("./spec/ast-43-group-by-entries-query.json"),
    });
  });

  // SELECT COUNT(Charakter.Charakter_Name)
  //   FROM Charakter
  //   INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
  // GROUP BY Charakter.Charakter_ID
  it("4: select-clause", () => {
    const node = new Node(steps[3].ast, undefined);
    expect(node.childrenCategoryNames.sort()).toEqual([
      "from",
      "groupBy",
      "select",
    ]);

    expect(node.getChildInCategory("select").toModel()).toEqual(
      desc.children.select[0]
    );

    expect(steps[3].description).toEqual({
      type: "select",
      expressions: ["COUNT(Charakter.Charakter_Name)"],
    });
  });

  // SELECT COUNT(Charakter.Charakter_Name)
  //   FROM Charakter
  //   INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
  // GROUP BY Charakter.Charakter_ID
  // ORDER BY COUNT() DESC, Charakter.Charakter_Name
  it("5: orderBy-clause", () => {
    expect(steps[4]).toBeDefined();
    const node = new Node(steps[4].ast, undefined);

    expect(node.childrenCategoryNames.sort()).toEqual([
      "from",
      "groupBy",
      "orderBy",
      "select",
    ]);
    expect(node.getChildInCategory("orderBy").toModel()).toEqual(
      desc.children.orderBy[0]
    );

    // only this enough?
    expect(node.toModel()).toEqual(desc);

    expect(steps[4].description).toEqual({
      type: "orderBy",
      expressions: ["COUNT() DESC", "Charakter.Charakter_Name"],
    });
  });
});

// SELECT Charakter.Charakter_Name, Geschichte.Geschichte_Name
//   FROM Charakter
// INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
// INNER JOIN Geschichte ON Auftritt.Geschichte_ID = Geschichte.Geschichte_ID
describe("two inner-joins", () => {
  const desc: NodeDescription = require("./spec/ast-44-two-inner-joins.json");
  const steps = stepwiseSqlQuery(desc);

  // SELECT *
  // FROM Charakter
  // INNER JOIN Auftritt
  it("1: cross-join", () => {
    expect(steps.length).toEqual(5);
    //crossJoinTest(steps[0], desc, 0);
    testJoin(steps[0], desc, 0, "crossJoin");
    expect(steps[0].description).toEqual({
      type: "cross",
      tables: ["Charakter", "Auftritt"],
    });
  });

  // SELECT *
  // FROM Charakter
  // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
  it("2: on-filter", () => {
    testJoinFilter(steps[1], desc, 0, "on");
    expect(steps[1].description).toEqual({
      type: "on",
      expressions: ["Auftritt.Charakter_ID = Charakter.Charakter_ID"],
    });
  });

  // SELECT *
  // FROM Charakter
  // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
  // INNER JOIN Geschichte
  it("3: second inner join", () => {
    testJoin(steps[2], desc, 1, "crossJoin");
    expect(steps[2].description).toEqual({
      type: "cross",
      tables: ["Zwischentabelle", "Geschichte"],
    });
  });

  // SELECT *
  // FROM Charakter
  // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
  // INNER JOIN Geschichte ON Auftritt.Geschichte_ID = Geschichte.Geschichte_ID
  it("4: second inner join with on-filter", () => {
    testJoinFilter(steps[3], desc, 1, "on");
    expect(steps[3].description).toEqual({
      type: "on",
      expressions: ["Auftritt.Geschichte_ID = Geschichte.Geschichte_ID"],
    });
  });

  // SELECT Charakter.Charakter_Name, Geschichte.Geschichte_Name
  // FROM Charakter
  // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
  // INNER JOIN Geschichte ON Auftritt.Geschichte_ID = Geschichte.Geschichte_ID
  it("5: fields from the select-clause", () => {
    const node = new Node(steps[4].ast, undefined);
    expect(node.childrenCategoryNames.sort()).toEqual(["from", "select"]);

    // contain all select fields
    expect(node.getChildInCategory("select").toModel()).toEqual(
      desc.children.select[0]
    );

    // only this enough?
    expect(node.toModel()).toEqual(desc);

    expect(steps[4].description).toEqual({
      type: "select",
      expressions: ["Charakter.Charakter_Name", "Geschichte.Geschichte_Name"],
    });
  });
});

// SELECT person.VNAME, person.NNAME, pruefung.NOTE
// FROM person
// INNER JOIN student USING ('pin')
// INNER JOIN pruefung USING ('pin')
//  WHERE person.VNAME LIKE '%Alex%' AND pruefung.NOTE < 5
describe("inner-join-using", () => {
  const desc: NodeDescription = require("./spec/ast-45-inner-join-using.json");
  const steps = stepwiseSqlQuery(desc);

  // SELECT *
  // FROM person
  // INNER JOIN student
  it("1: cross-join", () => {
    expect(steps.length).toEqual(6);
    testJoin(steps[0], desc, 0, "crossJoin");
    expect(steps[0].description).toEqual({
      type: "cross",
      tables: ["person", "student"],
    });
  });

  //  SELECT *
  //       FROM person
  //       INNER JOIN student USING ('pin')
  it("2: using-filter", () => {
    testJoinFilter(steps[1], desc, 0, "using");
    expect(steps[1].description).toEqual({
      type: "using",
      expressions: ["(pin)"],
    });
  });

  // SELECT *
  //       FROM person
  //       INNER JOIN student USING ('pin')
  //       INNER JOIN pruefung
  it("3: second inner join", () => {
    testJoin(steps[2], desc, 1, "crossJoin");
    expect(steps[2].description).toEqual({
      type: "cross",
      tables: ["Zwischentabelle", "pruefung"],
    });
  });

  // SELECT *
  //     FROM person
  //     INNER JOIN student USING ('pin')
  //     INNER JOIN pruefung USING ('pin')
  it("4: second inner join with on-filter", () => {
    testJoinFilter(steps[3], desc, 1, "using");
    expect(steps[3].description).toEqual({
      type: "using",
      expressions: ["(pin)"],
    });
  });

  // SELECT *
  //       FROM person
  //       INNER JOIN student USING ('pin')
  //       INNER JOIN pruefung USING ('pin')
  //     WHERE person.VNAME LIKE '%Alex%' AND pruefung.NOTE < 5
  it("5: where-clause", () => {
    const node = new Node(steps[4].ast, undefined);
    //console.log("after where-step: \n" + JSON.stringify(node.toModel(), undefined, 2));

    expect(node.childrenCategoryNames).toEqual(["select", "from", "where"]);
    starSelectTest(steps[4]);
    expect(node.getChildInCategory("where").toModel()).toEqual(
      desc.children.where[0]
    );

    expect(steps[4].description).toEqual({
      type: "where",
      expressions: ["person.VNAME LIKE %Alex%", "AND", "pruefung.NOTE < 5"],
    });
  });

  // SELECT person.VNAME, person.NNAME, pruefung.NOTE
  //       FROM person
  //       INNER JOIN student USING ('pin')
  //       INNER JOIN pruefung USING ('pin')
  //     WHERE person.VNAME LIKE '%Alex%' AND pruefung.NOTE < 5
  it("6: fields from the select-clause", () => {
    const node = new Node(steps[5].ast, undefined);
    expect(node.childrenCategoryNames.sort()).toEqual([
      "from",
      "select",
      "where",
    ]);

    // contain all select fields
    expect(node.getChildInCategory("select").toModel()).toEqual(
      desc.children.select[0]
    );

    // only this enough?
    expect(node.toModel()).toEqual(desc);

    expect(steps[5].description).toEqual({
      type: "select",
      expressions: ["person.VNAME", "person.NNAME", "pruefung.NOTE"],
    });
  });
});

// SELECT krankenkasse.KK_NAME, COUNT() - 1
//   FROM krankenkasse
//     LEFT JOIN person USING ('krankenkasse_id')
//     LEFT JOIN student USING ('pin')
//   GROUP BY krankenkasse.KRANKENKASSE_ID
//   ORDER BY COUNT()
describe("left-join-using", () => {
  const desc: NodeDescription = require("./spec/ast-46-two-left-joins.json");
  const steps = stepwiseSqlQuery(desc);

  // SELECT *
  // FROM krankenkasse
  //   LEFT JOIN person
  it("1: cross-join", () => {
    expect(steps.length).toEqual(9);
    //crossJoinTest(steps[0], desc, 0);
    testJoin(steps[0], desc, 0, "crossJoin");
    expect(steps[0].description).toEqual({
      type: "cross",
      tables: ["krankenkasse", "person"],
    });
  });

  //  SELECT *
  //   FROM krankenkasse
  //     INNER JOIN person USING ('krankenkasse_id')
  it("2: using-filter", () => {
    testJoinFilter(steps[1], desc, 0, "using");
    expect(steps[1].description).toEqual({
      type: "using",
      expressions: ["(krankenkasse_id)"],
    });
  });

  // SELECT *
  //   FROM krankenkasse
  //     LEFT JOIN person USING ('krankenkasse_id')
  it("3: left join", () => {
    //const node = new Node(steps[2].ast, undefined);
    //console.log("checkOnNode: \n" + JSON.stringify(node.toModel(), undefined, 2));
    testJoin(steps[2], desc, 0, "leftOuterJoinUsing", "using");

    expect(steps[2].description).toEqual({
      type: "outer",
      tables: ["krankenkasse", "person"],
    });
  });

  // SELECT *
  // FROM krankenkasse
  //   LEFT JOIN person USING ('krankenkasse_id')
  //   CROSS JOIN student
  it("4: second cross join", () => {
    //const node = new Node(steps[2].ast, undefined);
    //console.log("checkOnNode: \n" + JSON.stringify(node.toModel(), undefined, 2));
    testJoin(steps[3], desc, 1, "crossJoin");
    expect(steps[3].description).toEqual({
      type: "cross",
      tables: ["Zwischentabelle", "student"],
    });
  });

  // SELECT *
  //   FROM krankenkasse
  //     LEFT JOIN person USING ('krankenkasse_id')
  //     INNER JOIN student USING ('pin')
  it("5: using-filter", () => {
    testJoinFilter(steps[4], desc, 1, "using");
    expect(steps[4].description).toEqual({
      type: "using",
      expressions: ["(pin)"],
    });
  });

  //  SELECT *
  //   FROM krankenkasse
  //     LEFT JOIN person USING ('krankenkasse_id')
  //     LEFT JOIN student USING ('pin')
  it("6: left join", () => {
    //const node = new Node(steps[2].ast, undefined);
    //console.log("checkOnNode: \n" + JSON.stringify(node.toModel(), undefined, 2));
    testJoin(steps[5], desc, 1, "leftOuterJoinUsing", "using");

    expect(steps[5].description).toEqual({
      type: "outer",
      tables: ["Zwischentabelle", "student"],
    });
  });

  // SELECT *
  // FROM krankenkasse
  //   LEFT JOIN person USING ('krankenkasse_id')
  //   LEFT JOIN student USING ('pin')
  // GROUP BY krankenkasse.KRANKENKASSE_ID
  it("7: groupBy-clause", () => {
    expect(steps[6]).toBeDefined();
    const node = new Node(steps[6].ast, undefined);
    starSelectTest(steps[6]);

    expect(node.childrenCategoryNames).toEqual(["select", "from", "groupBy"]);
    expect(node.getChildInCategory("groupBy").toModel()).toEqual(
      desc.children.groupBy[0]
    );

    expect(steps[6].description).toEqual({
      type: "groupBy",
      expressions: ["krankenkasse.KRANKENKASSE_ID"],
      groupByEntriesDescription: require("./spec/ast-46-group-by-entries-query.json"),
    });
  });

  //  SELECT krankenkasse.KK_NAME, COUNT() - 1
  //   FROM krankenkasse
  //     LEFT JOIN person USING ('krankenkasse_id')
  //     LEFT JOIN student USING ('pin')
  //   GROUP BY krankenkasse.KRANKENKASSE_ID
  it("8: fields from the select-clause", () => {
    //TODO test the other nodes ?
    const t = new Tree(desc);
    const node = new Node(steps[7].ast, undefined);
    expect(node.childrenCategoryNames.sort()).toEqual([
      "from",
      "groupBy",
      "select",
    ]);

    // contain all select fields
    expect(node.getChildInCategory("select").toModel()).toEqual(
      desc.children.select[0]
    );
    expect(node.getChildInCategory("from").toModel()).toEqual(
      desc.children.from[0]
    );
    expect(node.getChildInCategory("groupBy").toModel()).toEqual(
      desc.children.groupBy[0]
    );

    expect(steps[7].description).toEqual({
      type: "select",
      expressions: ["krankenkasse.KK_NAME", "COUNT() - 1"],
    });
  });

  //  SELECT krankenkasse.KK_NAME, COUNT() - 1
  //   FROM krankenkasse
  //     LEFT OUTER JOIN person USING ('krankenkasse_id')
  //     LEFT OUTER JOIN student USING ('pin')
  //   GROUP BY krankenkasse.KRANKENKASSE_ID
  //   ORDER BY COUNT()
  it("9: orderBy-clause", () => {
    expect(steps[8]).toBeDefined();
    const node = new Node(steps[8].ast, undefined);
    //console.log("orderBy: \n" + JSON.stringify(node.toModel(), undefined, 2));

    expect(node.childrenCategoryNames.sort()).toEqual([
      "from",
      "groupBy",
      "orderBy",
      "select",
    ]);
    expect(node.getChildInCategory("orderBy").toModel()).toEqual(
      desc.children.orderBy[0]
    );

    // only this enough?
    expect(node.toModel()).toEqual(desc);

    expect(steps[8].description).toEqual({
      type: "orderBy",
      expressions: ["COUNT()"],
    });
  });
});

//  SELECT krankenkasse.KK_NAME, COUNT()
// FROM krankenkasse
// OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
// OUTER JOIN student USING ('pin')
// GROUP BY krankenkasse.krankenkasse_id
// ORDER BY COUNT()
describe("outer-join", () => {
  const desc: NodeDescription = require("./spec/ast-47-outer-join.json");
  const steps = stepwiseSqlQuery(desc);

  // SELECT *
  // FROM krankenkasse
  // CROSS JOIN person
  it("1: cross-join", () => {
    expect(steps.length).toEqual(8);
    testJoin(steps[0], desc, 0, "crossJoin");
    expect(steps[0].description).toEqual({
      type: "cross",
      tables: ["krankenkasse", "person"],
    });
  });

  //  SELECT *
  //   FROM krankenkasse
  //     INNER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
  it("2: on-filter", () => {
    testJoinFilter(steps[1], desc, 0, "on");
    expect(steps[1].description).toEqual({
      type: "on",
      expressions: ["krankenkasse.krankenkasse_id = person.krankenkasse_id"],
    });
  });

  // SELECT *
  // FROM krankenkasse
  //   OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
  it("3: outer join", () => {
    //const node = new Node(steps[2].ast, undefined);
    //console.log("checkOnNode: \n" + JSON.stringify(node.toModel(), undefined, 2));
    testJoin(steps[2], desc, 0, "outerJoinOn", "on");

    expect(steps[2].description).toEqual({
      type: "outer",
      tables: ["krankenkasse", "person"],
    });
  });

  // SELECT *
  // FROM krankenkasse
  //   OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
  //   CROSS JOIN student
  it("4: cross-join", () => {
    //crossJoinTest(steps[3], desc, 1);
    testJoin(steps[3], desc, 1, "crossJoin");
    expect(steps[3].description).toEqual({
      type: "cross",
      tables: ["Zwischentabelle", "student"],
    });
  });

  // SELECT *
  // FROM krankenkasse
  //   OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
  //   CROSS JOIN student USING ('pin')
  it("5: using-filter", () => {
    testJoinFilter(steps[4], desc, 1, "using");
    expect(steps[4].description).toEqual({
      type: "using",
      expressions: ["(pin)"],
    });
  });

  // SELECT *
  // FROM krankenkasse
  // OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
  // OUTER JOIN student USING ('pin')
  it("6: outer join", () => {
    //const node = new Node(steps[2].ast, undefined);
    //console.log("checkOnNode: \n" + JSON.stringify(node.toModel(), undefined, 2));
    testJoin(steps[5], desc, 1, "outerJoinUsing", "using");

    expect(steps[5].description).toEqual({
      type: "outer",
      tables: ["Zwischentabelle", "student"],
    });
  });

  // SELECT *
  // FROM krankenkasse
  // OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
  // OUTER JOIN student USING ('pin')
  // GROUP BY krankenkasse.krankenkasse_id
  it("7: groupBy-clause", () => {
    expect(steps[6]).toBeDefined();
    const node = new Node(steps[6].ast, undefined);
    starSelectTest(steps[6]);

    expect(node.childrenCategoryNames).toEqual(["select", "from", "groupBy"]);
    expect(node.getChildInCategory("groupBy").toModel()).toEqual(
      desc.children.groupBy[0]
    );

    expect(steps[6].description).toEqual({
      type: "groupBy",
      expressions: ["krankenkasse.KRANKENKASSE_ID"],
      groupByEntriesDescription: require("./spec/ast-47-group-by-entries-query.json"),
    });
  });

  // SELECT krankenkasse.KK_NAME, COUNT() -1
  // FROM krankenkasse
  // OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
  // OUTER JOIN student USING ('pin')
  // GROUP BY krankenkasse.krankenkasse_id
  it("8: fields from the select-clause", () => {
    //const t = new Tree(desc);
    const node = new Node(steps[7].ast, undefined);
    expect(node.childrenCategoryNames.sort()).toEqual([
      "from",
      "groupBy",
      "select",
    ]);

    expect(node.getChildInCategory("select").toModel()).toEqual(
      desc.children.select[0]
    );
    expect(node.getChildInCategory("from").toModel()).toEqual(
      desc.children.from[0]
    );
    expect(node.getChildInCategory("groupBy").toModel()).toEqual(
      desc.children.groupBy[0]
    );

    expect(steps[7].description).toEqual({
      type: "select",
      expressions: ["krankenkasse.KK_NAME", "COUNT() - 1"],
    });
  });
});

// SELECT tag.WOCHENTAG, termin.TAG, block.STARTZEIT, block.ENDZEIT
// FROM tag, termin, block
// WHERE termin.BLOCK = block.BLOCK AND termin.TAG = tag.TAG
describe("from with multiple tables", () => {
  const desc: NodeDescription = require("./spec/ast-48-from-multiple-tables.json");
  const steps = stepwiseSqlQuery(desc);

  // SELECT *
  // FROM tag, termin
  it("1: cross-join", () => {
    expect(steps.length).toEqual(4);
    //testJoinNode(steps[0], desc, 0, "crossJoin");
    const node = new Node(steps[0].ast, undefined);
    starSelectTest(steps[0]);
    expect(node.childrenCategoryNames).toEqual(["select", "from"]);

    const fromNode = node.getChildInCategory("from");
    expect(fromNode).toBeDefined();

    expect(fromNode.getChildrenInCategory("tables")[0].toModel()).toEqual(
      desc.children.from[0].children.tables[0]
    );
    expect(fromNode.getChildrenInCategory("tables")[1].toModel()).toEqual(
      desc.children.from[0].children.tables[1]
    );

    expect(steps[0].description).toEqual({
      type: "cross",
      tables: ["tag", "termin"],
    });
  });

  // SELECT *
  // FROM tag, termin, block
  it("2: cross-join", () => {
    const node = new Node(steps[1].ast, undefined);
    starSelectTest(steps[1]);
    expect(node.childrenCategoryNames).toEqual(["select", "from"]);

    const fromNode = node.getChildInCategory("from");
    expect(fromNode).toBeDefined();

    expect(fromNode.getChildrenInCategory("tables")[0].toModel()).toEqual(
      desc.children.from[0].children.tables[0]
    );
    expect(fromNode.getChildrenInCategory("tables")[1].toModel()).toEqual(
      desc.children.from[0].children.tables[1]
    );
    expect(fromNode.getChildrenInCategory("tables")[2].toModel()).toEqual(
      desc.children.from[0].children.tables[2]
    );
    expect(steps[1].description).toEqual({
      type: "cross",
      tables: ["Zwischentabelle", "block"],
    });
  });

  // SELECT *
  // FROM tag, termin, block
  // WHERE termin.BLOCK = block.BLOCK AND termin.TAG = tag.TAG
  it("3: where-clause", () => {
    const node = new Node(steps[2].ast, undefined);
    //console.log("after where-step: \n" + JSON.stringify(node.toModel(), undefined, 2));

    expect(node.childrenCategoryNames).toEqual(["select", "from", "where"]);
    starSelectTest(steps[2]);
    expect(node.getChildInCategory("where").toModel()).toEqual(
      desc.children.where[0]
    );

    expect(steps[2].description).toEqual({
      type: "where",
      expressions: [
        "termin.BLOCK = block.BLOCK",
        "AND",
        "termin.TAG = tag.TAG",
      ],
    });
  });

  // SELECT tag.WOCHENTAG, termin.TAG, block.STARTZEIT, block.ENDZEIT
  // FROM tag, termin, block
  // WHERE termin.BLOCK = block.BLOCK AND termin.TAG = tag.TAG
  it("4: select-clause", () => {
    const node = new Node(steps[3].ast, undefined);
    expect(node.childrenCategoryNames.sort()).toEqual([
      "from",
      "select",
      "where",
    ]);

    expect(node.getChildInCategory("select").toModel()).toEqual(
      desc.children.select[0]
    );
    const fromNode = node.getChildInCategory("from");
    expect(fromNode.getChildrenInCategory("tables")[0].toModel()).toEqual(
      desc.children.from[0].children.tables[0]
    );
    expect(fromNode.getChildrenInCategory("tables")[1].toModel()).toEqual(
      desc.children.from[0].children.tables[1]
    );
    expect(fromNode.getChildrenInCategory("tables")[2].toModel()).toEqual(
      desc.children.from[0].children.tables[2]
    );
    expect(node.getChildInCategory("where").toModel()).toEqual(
      desc.children.where[0]
    );

    expect(steps[3].description).toEqual({
      type: "select",
      expressions: [
        "tag.WOCHENTAG",
        "termin.TAG",
        "block.STARTZEIT",
        "block.ENDZEIT",
      ],
    });
  });
});

// SELECT lkz.LAND, COUNT() - 1
// FROM student
// 	INNER JOIN adresse USING ('pin')
// 	RIGHT OUTER JOIN lkz USING ('lkz')
// GROUP BY lkz.LKZ
describe("inner-join-right-join-group-by", () => {
  const desc: NodeDescription = require("./spec/ast-49-inner-join-right-join-group-by.json");
  const steps = stepwiseSqlQuery(desc);

  // SELECT *
  // FROM student
  // 	CROSS JOIN adresse
  it("1: cross-join", () => {
    expect(steps.length).toEqual(7);
    testJoin(steps[0], desc, 0, "crossJoin");
    expect(steps[0].description).toEqual({
      type: "cross",
      tables: ["student", "adresse"],
    });
  });

  // SELECT *
  // FROM student
  // 	INNER JOIN adresse USING ('pin')
  it("2: using-filter", () => {
    testJoinFilter(steps[1], desc, 0, "using");
    expect(steps[1].description).toEqual({
      type: "using",
      expressions: ["(pin)"],
    });
  });

  // SELECT *
  // FROM student
  // 	INNER JOIN adresse USING ('pin')
  // 	CROSS JOIN lkz
  it("3: second cross", () => {
    testJoin(steps[2], desc, 1, "crossJoin");
    expect(steps[2].description).toEqual({
      type: "cross",
      tables: ["Zwischentabelle", "lkz"],
    });
  });

  // SELECT *
  // FROM student
  // 	INNER JOIN adresse USING ('pin')
  // 	INNER JOIN lkz USING ('lkz')
  it("4: second inner join using", () => {
    testJoinFilter(steps[3], desc, 1, "using");
    expect(steps[3].description).toEqual({
      type: "using",
      expressions: ["(lkz)"],
    });
  });

  // SELECT *
  // FROM student
  // 	INNER JOIN adresse USING ('pin')
  // 	RIGHT OUTER JOIN lkz USING ('lkz')
  it("5: right join", () => {
    //const node = new Node(steps[2].ast, undefined);
    //console.log("right outer join: \n" + JSON.stringify(node.toModel(), undefined, 2));
    testJoin(steps[4], desc, 1, "rightOuterJoinUsing", "using");

    expect(steps[4].description).toEqual({
      type: "outer",
      tables: ["Zwischentabelle", "lkz"],
    });
  });

  // SELECT *
  // FROM student
  // 	INNER JOIN adresse USING ('pin')
  // 	RIGHT OUTER JOIN lkz USING ('lkz')
  // GROUP BY lkz.LKZ
  it("6: groupBy-clause", () => {
    expect(steps[5]).toBeDefined();
    const node = new Node(steps[5].ast, undefined);
    starSelectTest(steps[5]);

    expect(node.childrenCategoryNames).toEqual(["select", "from", "groupBy"]);
    expect(node.getChildInCategory("groupBy").toModel()).toEqual(
      desc.children.groupBy[0]
    );

    expect(steps[5].description).toEqual({
      type: "groupBy",
      expressions: ["lkz.LKZ"],
      groupByEntriesDescription: require("./spec/ast-49-group-by-entries-query.json"),
    });
  });

  // SELECT lkz.LAND, COUNT() - 1
  // FROM student
  // 	INNER JOIN adresse USING ('pin')
  // 	RIGHT OUTER JOIN lkz USING ('lkz')
  // GROUP BY lkz.LKZ
  it("7: fields from the select-clause", () => {
    const node = new Node(steps[6].ast, undefined);
    expect(node.childrenCategoryNames.sort()).toEqual([
      "from",
      "groupBy",
      "select",
    ]);

    expect(node.getChildInCategory("select").toModel()).toEqual(
      desc.children.select[0]
    );
    expect(node.getChildInCategory("from").toModel()).toEqual(
      desc.children.from[0]
    );
    expect(node.getChildInCategory("groupBy").toModel()).toEqual(
      desc.children.groupBy[0]
    );

    expect(steps[6].description).toEqual({
      type: "select",
      expressions: ["lkz.LAND", "COUNT() - 1"],
    });
  });
});
