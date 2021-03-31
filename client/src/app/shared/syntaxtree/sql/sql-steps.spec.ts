import {
  stepwiseSqlQuery,
  SqlStepDescription,
  SqlStepJoinDescription,
  SqlStepConditionFilterDescription,
  JoinType,
} from "./sql-steps";
import { SyntaxTree, SyntaxNode, NodeDescription } from "../syntaxtree";

function starSelectTest(stepDesc: SqlStepDescription) {
  const node = new SyntaxNode(stepDesc.ast, undefined);
  expect(node.typeName).toEqual("querySelect");
  expect(node.getChildrenInCategory("select").length).toEqual(1);
  const selectNode = node.getChildInCategory("select");
  expect(selectNode.getChildrenInCategory("columns").length).toEqual(1);
  expect(selectNode.getChildInCategory("columns").typeName).toEqual(
    "starOperator"
  );
}

function testFromTable(
  stepDesc: SqlStepDescription,
  desc: NodeDescription,
  tableName: string
) {
  const node = new SyntaxNode(stepDesc.ast, undefined);
  expect(node.childrenCategoryNames).toEqual(["select", "from"]);
  expect(node.getChildInCategory("from").childrenCategoryNames).toEqual([
    "tables",
  ]);
  expect(
    node.getChildInCategory("from").getChildrenInCategory("tables").length
  ).toEqual(1);
  expect(
    node.getChildInCategory("from").getChildInCategory("tables").toModel()
  ).toEqual(desc.children.from[0].children.tables[0]);
  expect(stepDesc.description).toEqual({
    type: "from",
    table: tableName,
  });
}

function testJoin(
  stepDesc: SqlStepDescription,
  desc: NodeDescription,
  childIndex: number,
  nodeTyp: string,
  filterName?: string
) {
  const node = new SyntaxNode(stepDesc.ast, undefined);

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

  // description tables
  let firstTable =
    childIndex == 0
      ? desc.children.from[0].children.tables[0].properties.name
      : "Zwischentabelle";

  expect(<SqlStepJoinDescription>stepDesc.description).toEqual({
    type: nodeTyp as JoinType,
    tables: [
      firstTable,
      desc.children.from[0].children.joins[childIndex].children.table[0]
        .properties.name,
    ],
  });
}

function testJoinFilter(
  stepDesc: SqlStepDescription,
  desc: NodeDescription,
  index: number,
  filter: string,
  columnNames: string[]
) {
  const srcTree = new SyntaxTree(desc);
  const node = new SyntaxNode(stepDesc.ast, undefined);
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
    srcTree
      .locate([
        ["from", 0],
        ["joins", index],
        [filter, 0],
      ])
      .toModel()
  );

  // description expressions
  if (filter == "on") {
    let lhs = srcTree.locate([
      ["from", 0],
      ["joins", index],
      ["on", 0],
      ["lhs", 0],
    ]);
    let rhs = srcTree.locate([
      ["from", 0],
      ["joins", index],
      ["on", 0],
      ["rhs", 0],
    ]);
    let op = srcTree.locate([
      ["from", 0],
      ["joins", index],
      ["on", 0],
      ["operator", 0],
    ]);

    expect(<SqlStepConditionFilterDescription>stepDesc.description).toEqual({
      type: "on",
      expressions: [
        lhs.properties.refTableName +
          "." +
          lhs.properties.columnName +
          " " +
          op.properties.operator +
          " " +
          rhs.properties.refTableName +
          "." +
          rhs.properties.columnName,
      ],
      columnNames: columnNames,
    });
  } else {
    expect(<SqlStepConditionFilterDescription>stepDesc.description).toEqual({
      type: "using",
      expressions: [
        srcTree.locate([
          ["from", 0],
          ["joins", index],
          ["using", 0],
          ["expression", 0],
        ]).properties.value,
      ],
      columnNames: columnNames,
    });
  }
}

describe(`SQL Steps`, () => {
  it(`Empty Tree`, () => {
    expect(stepwiseSqlQuery(undefined)).toEqual([]);
  });

  it("Basic select-from, not breaking down", () => {
    const desc: NodeDescription = require("./spec/ast-40-select-from.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));
    let node = new SyntaxNode(steps[0].ast, undefined);

    expect(steps.length).toEqual(2);

    starSelectTest(steps[0]);
    expect(node.toModel()).toEqual(desc);

    expect(steps[0].description).toEqual({
      type: "from",
      table: "Charakter",
    });

    node = new SyntaxNode(steps[1].ast, undefined);
    starSelectTest(steps[1]);
    expect(node.toModel()).toEqual(desc);

    expect(steps[1].description).toEqual({
      type: "select",
      expressions: ["*"],
    });
  });

  describe(`simple where filter`, () => {
    const desc: NodeDescription = require("./spec/ast-41-select-from-where.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));

    it("first from table", () => {
      expect(steps.length).toEqual(3);
      testFromTable(steps[0], desc, "adresse");
    });

    it("where step", () => {
      const node = new SyntaxNode(steps[1].ast, undefined);
      expect(node.childrenCategoryNames).toEqual(["select", "from", "where"]);

      starSelectTest(steps[1]);

      expect(node.getChildInCategory("where").toModel()).toEqual(
        desc.children.where[0]
      );

      let cfDesc = <SqlStepConditionFilterDescription>steps[1].description;
      expect(cfDesc.type).toEqual("where");
      expect(cfDesc.expressions).toEqual(["adresse.LKZ <> D"]);
      expect(cfDesc.columnNames).toEqual(["adresse.LKZ"]);
    });

    //fields from the select-clause and the where-clause
    it("select step", () => {
      const node = new SyntaxNode(steps[2].ast, undefined);
      expect(node.childrenCategoryNames).toEqual(["select", "from", "where"]);
      // fields from select should correspond to initial-query
      expect(node.getChildInCategory("select").toModel()).toEqual(
        desc.children.select[0]
      );

      //where should correspond to initial-query----- maybe redundant?
      expect(node.getChildInCategory("where").toModel()).toEqual(
        desc.children.where[0]
      );

      expect(steps[2].description).toEqual({
        type: "select",
        expressions: ["termin.TAG"],
      });
    });
  });

  describe("simple join", () => {
    // select Charakter.Charakter_Name
    // from Charakter inner join Auftritt on Auftritt.Charakter_ID = Charakter.Charakter_ID
    const desc: NodeDescription = require("./spec/ast-42-simple-join.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));

    it("first from table", () => {
      expect(steps.length).toEqual(4);
      testFromTable(steps[0], desc, "Charakter");
    });

    it("cross join", () => {
      testJoin(steps[1], desc, 0, "crossJoin");
    });

    it("on-clouse", () => {
      testJoinFilter(steps[2], desc, 0, "on", [
        "Auftritt.Charakter_ID",
        "Charakter.Charakter_ID",
      ]);
    });

    it("select-clause", () => {
      expect(steps[3].ast).toEqual(desc);
      expect(steps[3].description).toEqual({
        type: "select",
        expressions: ["Charakter.Charakter_Name"],
      });
    });
  });

  describe("query with join,group,order", () => {
    //  SELECT COUNT(Charakter.Charakter_Name)
    //       FROM Charakter
    // 	    INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    //     GROUP BY Charakter.Charakter_ID
    //     ORDER BY COUNT() DESC, Charakter.Charakter_Name
    const desc: NodeDescription = require("./spec/ast-43-join-group-order.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));

    // SELECT *
    // FROM Charakter
    it("first from table", () => {
      expect(steps.length).toEqual(6);
      testFromTable(steps[0], desc, "Charakter");
    });

    // SELECT *
    // FROM Charakter
    // INNER JOIN Auftritt
    it("cross join", () => {
      testJoin(steps[1], desc, 0, "crossJoin");
    });

    //  SELECT *
    // FROM Charakter
    // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    it("on-clouse", () => {
      testJoinFilter(steps[2], desc, 0, "on", [
        "Auftritt.Charakter_ID",
        "Charakter.Charakter_ID",
      ]);
    });

    // SELECT *
    //   FROM Charakter
    //   INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    // GROUP BY Charakter.Charakter_ID
    it("groupBy-clouse", () => {
      expect(steps[3]).toBeDefined();
      const node = new SyntaxNode(steps[3].ast, undefined);
      starSelectTest(steps[2]);
      expect(node.childrenCategoryNames).toEqual(["select", "from", "groupBy"]);
      expect(node.getChildInCategory("groupBy").toModel()).toEqual(
        desc.children.groupBy[0]
      );

      expect(steps[3].description).toEqual({
        type: "groupBy",
        expressions: ["Charakter.Charakter_ID"],
        //correspondingOrderBy: require("./spec/ast-43-group-by-entries-query.json"),
      });
    });

    // SELECT COUNT(Charakter.Charakter_Name)
    //   FROM Charakter
    //   INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    // GROUP BY Charakter.Charakter_ID
    it("select-clause", () => {
      const node = new SyntaxNode(steps[4].ast, undefined);
      expect(node.childrenCategoryNames.sort()).toEqual([
        "from",
        "groupBy",
        "select",
      ]);

      expect(node.getChildInCategory("select").toModel()).toEqual(
        desc.children.select[0]
      );

      expect(steps[4].description).toEqual({
        type: "select",
        expressions: ["COUNT(Charakter.Charakter_Name)"],
      });
    });

    // SELECT COUNT(Charakter.Charakter_Name)
    //   FROM Charakter
    //   INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    // GROUP BY Charakter.Charakter_ID
    // ORDER BY COUNT() DESC, Charakter.Charakter_Name
    it("orderBy-clause", () => {
      expect(steps[5]).toBeDefined();
      const node = new SyntaxNode(steps[5].ast, undefined);

      expect(node.childrenCategoryNames.sort()).toEqual([
        "from",
        "groupBy",
        "orderBy",
        "select",
      ]);
      expect(node.getChildInCategory("orderBy").toModel()).toEqual(
        desc.children.orderBy[0]
      );

      // expect last step to ne equal to resource
      expect(node.toModel()).toEqual(desc);

      expect(steps[5].description).toEqual({
        type: "orderBy",
        expressions: ["COUNT() DESC", "Charakter.Charakter_Name"],
      });
    });
  });

  describe("two inner-joins", () => {
    // SELECT Charakter.Charakter_Name, Geschichte.Geschichte_Name
    //   FROM Charakter
    // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    // INNER JOIN Geschichte ON Auftritt.Geschichte_ID = Geschichte.Geschichte_ID
    const desc: NodeDescription = require("./spec/ast-44-two-inner-joins.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));

    // SELECT *
    // FROM Charakter
    it("first from table", () => {
      expect(steps.length).toEqual(6);
      testFromTable(steps[0], desc, "Charakter");
    });

    // SELECT *
    // FROM Charakter
    // INNER JOIN Auftritt
    it("cross-join", () => {
      testJoin(steps[1], desc, 0, "crossJoin");
    });

    // SELECT *
    // FROM Charakter
    // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    it("on-filter", () => {
      testJoinFilter(steps[2], desc, 0, "on", [
        "Auftritt.Charakter_ID",
        "Charakter.Charakter_ID",
      ]);
    });

    // SELECT *
    // FROM Charakter
    // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    // INNER JOIN Geschichte
    it("second inner join", () => {
      testJoin(steps[3], desc, 1, "crossJoin");
    });

    // SELECT *
    // FROM Charakter
    // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    // INNER JOIN Geschichte ON Auftritt.Geschichte_ID = Geschichte.Geschichte_ID
    it("second inner join with on-filter", () => {
      testJoinFilter(steps[4], desc, 1, "on", [
        "Auftritt.Geschichte_ID",
        "Geschichte.Geschichte_ID",
      ]);
    });

    // SELECT Charakter.Charakter_Name, Geschichte.Geschichte_Name
    // FROM Charakter
    // INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    // INNER JOIN Geschichte ON Auftritt.Geschichte_ID = Geschichte.Geschichte_ID
    it("fields from the select-clause", () => {
      const node = new SyntaxNode(steps[5].ast, undefined);
      expect(node.childrenCategoryNames.sort()).toEqual(["from", "select"]);

      // contain all select fields
      expect(node.getChildInCategory("select").toModel()).toEqual(
        desc.children.select[0]
      );

      expect(node.toModel()).toEqual(desc);

      expect(steps[5].description).toEqual({
        type: "select",
        expressions: ["Charakter.Charakter_Name", "Geschichte.Geschichte_Name"],
      });
    });
  });

  describe("inner-join-using", () => {
    // SELECT person.VNAME, person.NNAME, pruefung.NOTE
    // FROM person
    // INNER JOIN student USING ('pin')
    // INNER JOIN pruefung USING ('pin')
    //  WHERE person.VNAME LIKE '%Alex%' AND pruefung.NOTE < 5
    const desc: NodeDescription = require("./spec/ast-45-inner-join-using.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));

    // SELECT *
    // FROM person
    it("first from table", () => {
      expect(steps.length).toEqual(7);
      testFromTable(steps[0], desc, "person");
    });

    // SELECT *
    // FROM person
    // INNER JOIN student
    it("cross-join", () => {
      testJoin(steps[1], desc, 0, "crossJoin");
    });

    //  SELECT *
    //       FROM person
    //       INNER JOIN student USING ('pin')
    it("using-filter", () => {
      testJoinFilter(steps[2], desc, 0, "using", ["pin", "student.pin"]);
    });

    // SELECT *
    //       FROM person
    //       INNER JOIN student USING ('pin')
    //       INNER JOIN pruefung
    it("second inner join", () => {
      testJoin(steps[3], desc, 1, "crossJoin");
    });

    // SELECT *
    //     FROM person
    //     INNER JOIN student USING ('pin')
    //     INNER JOIN pruefung USING ('pin')
    it("second inner join with on-filter", () => {
      testJoinFilter(steps[4], desc, 1, "using", ["pin", "pruefung.pin"]);
    });

    // SELECT *
    //       FROM person
    //       INNER JOIN student USING ('pin')
    //       INNER JOIN pruefung USING ('pin')
    //     WHERE person.VNAME LIKE '%Alex%' AND pruefung.NOTE < 5
    it("where-clause", () => {
      const node = new SyntaxNode(steps[5].ast, undefined);
      expect(node.childrenCategoryNames).toEqual(["select", "from", "where"]);
      starSelectTest(steps[5]);
      expect(node.getChildInCategory("where").toModel()).toEqual(
        desc.children.where[0]
      );

      expect(steps[5].description).toEqual({
        type: "where",
        expressions: ["person.VNAME LIKE %Alex%", "AND", "pruefung.NOTE < 5"],
        columnNames: ["person.VNAME", "pruefung.NOTE"],
      });
    });

    // SELECT person.VNAME, person.NNAME, pruefung.NOTE
    //       FROM person
    //       INNER JOIN student USING ('pin')
    //       INNER JOIN pruefung USING ('pin')
    //     WHERE person.VNAME LIKE '%Alex%' AND pruefung.NOTE < 5
    it("fields from the select-clause", () => {
      const node = new SyntaxNode(steps[6].ast, undefined);
      expect(node.childrenCategoryNames.sort()).toEqual([
        "from",
        "select",
        "where",
      ]);

      // contain all select fields
      expect(node.getChildInCategory("select").toModel()).toEqual(
        desc.children.select[0]
      );

      expect(node.toModel()).toEqual(desc);

      expect(steps[6].description).toEqual({
        type: "select",
        expressions: ["person.VNAME", "person.NNAME", "pruefung.NOTE"],
      });
    });
  });

  describe("left-join-using", () => {
    // SELECT krankenkasse.KK_NAME, COUNT() - 1
    //   FROM krankenkasse
    //     LEFT JOIN person USING ('krankenkasse_id')
    //     LEFT JOIN student USING ('pin')
    //   GROUP BY krankenkasse.KRANKENKASSE_ID
    //   ORDER BY COUNT()
    const desc: NodeDescription = require("./spec/ast-46-two-left-joins.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));

    // SELECT *
    // FROM krankenkasse
    it("first from table", () => {
      expect(steps.length).toEqual(10);
      testFromTable(steps[0], desc, "krankenkasse");
    });

    // SELECT *
    // FROM krankenkasse
    //   LEFT JOIN person
    it("cross-join", () => {
      testJoin(steps[1], desc, 0, "crossJoin");
    });

    //  SELECT *
    //   FROM krankenkasse
    //     INNER JOIN person USING ('krankenkasse_id')
    it("using-filter", () => {
      testJoinFilter(steps[2], desc, 0, "using", [
        "krankenkasse_id",
        "person.krankenkasse_id",
      ]);
    });

    // SELECT *
    //   FROM krankenkasse
    //     LEFT JOIN person USING ('krankenkasse_id')
    it("left join", () => {
      testJoin(steps[3], desc, 0, "leftOuterJoinUsing", "using");
    });

    // SELECT *
    // FROM krankenkasse
    //   LEFT JOIN person USING ('krankenkasse_id')
    //   CROSS JOIN student
    it("second cross join", () => {
      testJoin(steps[4], desc, 1, "crossJoin");
    });

    // SELECT *
    //   FROM krankenkasse
    //     LEFT JOIN person USING ('krankenkasse_id')
    //     INNER JOIN student USING ('pin')
    it("using-filter", () => {
      testJoinFilter(steps[5], desc, 1, "using", ["pin", "student.pin"]);
    });

    //  SELECT *
    //   FROM krankenkasse
    //     LEFT JOIN person USING ('krankenkasse_id')
    //     LEFT JOIN student USING ('pin')
    it("left join", () => {
      testJoin(steps[6], desc, 1, "leftOuterJoinUsing", "using");
    });

    // SELECT *
    // FROM krankenkasse
    //   LEFT JOIN person USING ('krankenkasse_id')
    //   LEFT JOIN student USING ('pin')
    // GROUP BY krankenkasse.KRANKENKASSE_ID
    it("groupBy-clause", () => {
      expect(steps[7]).toBeDefined();
      const node = new SyntaxNode(steps[7].ast, undefined);
      starSelectTest(steps[7]);

      expect(node.childrenCategoryNames).toEqual(["select", "from", "groupBy"]);
      expect(node.getChildInCategory("groupBy").toModel()).toEqual(
        desc.children.groupBy[0]
      );

      expect(steps[7].description).toEqual({
        type: "groupBy",
        expressions: ["krankenkasse.KRANKENKASSE_ID"],
      });
    });

    //  SELECT krankenkasse.KK_NAME, COUNT() - 1
    //   FROM krankenkasse
    //     LEFT JOIN person USING ('krankenkasse_id')
    //     LEFT JOIN student USING ('pin')
    //   GROUP BY krankenkasse.KRANKENKASSE_ID
    it("fields from the select-clause", () => {
      //TODO test the other nodes ?
      const t = new SyntaxTree(desc);
      const node = new SyntaxNode(steps[8].ast, undefined);
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

      expect(steps[8].description).toEqual({
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
    it("orderBy-clause", () => {
      expect(steps[8]).toBeDefined();
      const node = new SyntaxNode(steps[9].ast, undefined);

      expect(node.childrenCategoryNames.sort()).toEqual([
        "from",
        "groupBy",
        "orderBy",
        "select",
      ]);
      expect(node.getChildInCategory("orderBy").toModel()).toEqual(
        desc.children.orderBy[0]
      );

      // expect last step to be equal to resource
      expect(node.toModel()).toEqual(desc);

      expect(steps[9].description).toEqual({
        type: "orderBy",
        expressions: ["COUNT()"],
      });
    });
  });

  describe("outer-join", () => {
    //  SELECT krankenkasse.KK_NAME, COUNT()
    // FROM krankenkasse
    // OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
    // OUTER JOIN student USING ('pin')
    // GROUP BY krankenkasse.krankenkasse_id
    // ORDER BY COUNT()
    const desc: NodeDescription = require("./spec/ast-47-outer-join.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));

    // SELECT *
    // FROM krankenkasse
    it("first from table", () => {
      expect(steps.length).toEqual(9);
      testFromTable(steps[0], desc, "krankenkasse");
    });

    // SELECT *
    // FROM krankenkasse
    // CROSS JOIN person
    it("cross-join", () => {
      testJoin(steps[1], desc, 0, "crossJoin");
    });

    //  SELECT *
    //   FROM krankenkasse
    //     INNER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
    it("on-filter", () => {
      testJoinFilter(steps[2], desc, 0, "on", [
        "krankenkasse.krankenkasse_id",
        "person.krankenkasse_id",
      ]);
    });

    // SELECT *
    // FROM krankenkasse
    //   OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
    it("outer join", () => {
      //const node = new Node(steps[2].ast, undefined);
      //console.log("checkOnNode: \n" + JSON.stringify(node.toModel(), undefined, 2));
      testJoin(steps[3], desc, 0, "outerJoinOn", "on");
    });

    // SELECT *
    // FROM krankenkasse
    //   OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
    //   CROSS JOIN student
    it("cross-join", () => {
      testJoin(steps[4], desc, 1, "crossJoin");
    });

    // SELECT *
    // FROM krankenkasse
    //   OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
    //   CROSS JOIN student USING ('pin')
    it("using-filter", () => {
      testJoinFilter(steps[5], desc, 1, "using", ["pin", "student.pin"]);
    });

    // SELECT *
    // FROM krankenkasse
    // OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
    // OUTER JOIN student USING ('pin')
    it("outer join", () => {
      testJoin(steps[6], desc, 1, "outerJoinUsing", "using");
    });

    // SELECT *
    // FROM krankenkasse
    // OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
    // OUTER JOIN student USING ('pin')
    // GROUP BY krankenkasse.krankenkasse_id
    it("groupBy-clause", () => {
      expect(steps[7]).toBeDefined();
      const node = new SyntaxNode(steps[7].ast, undefined);
      starSelectTest(steps[7]);

      expect(node.childrenCategoryNames).toEqual(["select", "from", "groupBy"]);
      expect(node.getChildInCategory("groupBy").toModel()).toEqual(
        desc.children.groupBy[0]
      );

      expect(steps[7].description).toEqual({
        type: "groupBy",
        expressions: ["krankenkasse.KRANKENKASSE_ID"],
      });
    });

    // SELECT krankenkasse.KK_NAME, COUNT() -1
    // FROM krankenkasse
    // OUTER JOIN person ON krankenkasse.krankenkasse_id = person.krankenkasse_id
    // OUTER JOIN student USING ('pin')
    // GROUP BY krankenkasse.krankenkasse_id
    it("fields from the select-clause", () => {
      //const t = new Tree(desc);
      const node = new SyntaxNode(steps[8].ast, undefined);
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

      expect(steps[8].description).toEqual({
        type: "select",
        expressions: ["krankenkasse.KK_NAME", "COUNT() - 1"],
      });
    });
  });

  describe("from with multiple tables", () => {
    // SELECT tag.WOCHENTAG, termin.TAG, block.STARTZEIT, block.ENDZEIT
    // FROM tag, termin, block
    // WHERE termin.BLOCK = block.BLOCK AND termin.TAG = tag.TAG
    const desc: NodeDescription = require("./spec/ast-48-from-multiple-tables.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));

    // SELECT *
    // FROM tag
    it("first from table", () => {
      expect(steps.length).toEqual(5);
      testFromTable(steps[0], desc, "tag");
    });

    // SELECT *
    // FROM tag, termin
    it("cross-join", () => {
      const node = new SyntaxNode(steps[1].ast, undefined);
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
    });

    // SELECT *
    // FROM tag, termin, block
    it("cross-join", () => {
      const node = new SyntaxNode(steps[2].ast, undefined);
      starSelectTest(steps[2]);
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
    });

    // SELECT *
    // FROM tag, termin, block
    // WHERE termin.BLOCK = block.BLOCK AND termin.TAG = tag.TAG
    it("where-clause", () => {
      const node = new SyntaxNode(steps[3].ast, undefined);
      //console.log("after where-step: \n" + JSON.stringify(node.toModel(), undefined, 2));

      expect(node.childrenCategoryNames).toEqual(["select", "from", "where"]);
      starSelectTest(steps[3]);
      expect(node.getChildInCategory("where").toModel()).toEqual(
        desc.children.where[0]
      );

      expect(steps[3].description).toEqual({
        type: "where",
        expressions: [
          "termin.BLOCK = block.BLOCK",
          "AND",
          "termin.TAG = tag.TAG",
        ],
        columnNames: ["termin.BLOCK", "block.BLOCK", "termin.TAG", "tag.TAG"],
      });
    });

    // SELECT tag.WOCHENTAG, termin.TAG, block.STARTZEIT, block.ENDZEIT
    // FROM tag, termin, block
    // WHERE termin.BLOCK = block.BLOCK AND termin.TAG = tag.TAG
    it("select-clause", () => {
      const node = new SyntaxNode(steps[4].ast, undefined);
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

      expect(steps[4].description).toEqual({
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

  describe("inner-join-right-join-group-by", () => {
    // SELECT lkz.LAND, COUNT() - 1
    // FROM student
    // 	INNER JOIN adresse USING ('pin')
    // 	RIGHT OUTER JOIN lkz USING ('lkz')
    // GROUP BY lkz.LKZ
    const desc: NodeDescription = require("./spec/ast-49-inner-join-right-join-group-by.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));

    // SELECT *
    // FROM student
    it("first from table", () => {
      expect(steps.length).toEqual(8);
      testFromTable(steps[0], desc, "student");
    });

    // SELECT *
    // FROM student
    // 	CROSS JOIN adresse
    it("cross-join", () => {
      testJoin(steps[1], desc, 0, "crossJoin");
    });

    // SELECT *
    // FROM student
    // 	INNER JOIN adresse USING ('pin')
    it("using-filter", () => {
      testJoinFilter(steps[2], desc, 0, "using", ["pin", "adresse.pin"]);
    });

    // SELECT *
    // FROM student
    // 	INNER JOIN adresse USING ('pin')
    // 	CROSS JOIN lkz
    it("second cross", () => {
      testJoin(steps[3], desc, 1, "crossJoin");
    });

    // SELECT *
    // FROM student
    // 	INNER JOIN adresse USING ('pin')
    // 	INNER JOIN lkz USING ('lkz')
    it("second inner join using", () => {
      testJoinFilter(steps[4], desc, 1, "using", ["lkz", "lkz.lkz"]);
    });

    // SELECT *
    // FROM student
    // 	INNER JOIN adresse USING ('pin')
    // 	RIGHT OUTER JOIN lkz USING ('lkz')
    it("right join", () => {
      //const node = new Node(steps[2].ast, undefined);
      //console.log("right outer join: \n" + JSON.stringify(node.toModel(), undefined, 2));
      testJoin(steps[5], desc, 1, "rightOuterJoinUsing", "using");
    });

    // SELECT *
    // FROM student
    // 	INNER JOIN adresse USING ('pin')
    // 	RIGHT OUTER JOIN lkz USING ('lkz')
    // GROUP BY lkz.LKZ
    it("groupBy-clause", () => {
      expect(steps[6]).toBeDefined();
      const node = new SyntaxNode(steps[6].ast, undefined);
      starSelectTest(steps[6]);

      expect(node.childrenCategoryNames).toEqual(["select", "from", "groupBy"]);
      expect(node.getChildInCategory("groupBy").toModel()).toEqual(
        desc.children.groupBy[0]
      );

      expect(steps[6].description).toEqual({
        type: "groupBy",
        expressions: ["lkz.LKZ"],
        //correspondingOrderBy: require("./spec/ast-49-group-by-entries-query.json"),
      });
    });

    // SELECT lkz.LAND, COUNT() - 1
    // FROM student
    // 	INNER JOIN adresse USING ('pin')
    // 	RIGHT OUTER JOIN lkz USING ('lkz')
    // GROUP BY lkz.LKZ
    it("fields from the select-clause", () => {
      const node = new SyntaxNode(steps[7].ast, undefined);
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
        expressions: ["lkz.LAND", "COUNT() - 1"],
      });
    });
  });

  describe("distinct", () => {
    //SELECT DISTINCT veranst_termin.RAUM_ID, veranstaltung.VERANSTALTUNG_BEZ, veranst_termin.TERMIN_ID
    //FROM veranstaltung
    //  INNER JOIN veranst_termin USING ('VERANSTALTUNG_ID')
    const desc: NodeDescription = require("./spec/ast-50-join-distinct.json");
    const steps = stepwiseSqlQuery(new SyntaxTree(desc));

    // SELECT *
    // FROM veranstaltung
    it("first from table", () => {
      expect(steps.length).toEqual(5);
      testFromTable(steps[0], desc, "veranstaltung");
    });

    //SELECT *
    //FROM veranstaltung
    //  CROSS JOIN veranst_termin
    it("1: cross-join", () => {
      testJoin(steps[1], desc, 0, "crossJoin");
    });

    //SELECT *
    //FROM veranstaltung
    //  INNER JOIN veranst_termin USING ('VERANSTALTUNG_ID')
    it("using-filter", () => {
      testJoinFilter(steps[2], desc, 0, "using", [
        "VERANSTALTUNG_ID",
        "veranst_termin.VERANSTALTUNG_ID",
      ]);
    });

    //SELECT veranst_termin.RAUM_ID, veranstaltung.VERANSTALTUNG_BEZ, veranst_termin.TERMIN_ID
    //FROM veranstaltung
    //  INNER JOIN veranst_termin USING ('VERANSTALTUNG_ID')
    it("fields from the select-clause without distinct", () => {
      const node = new SyntaxNode(steps[3].ast, undefined);
      expect(node.childrenCategoryNames.sort()).toEqual(["from", "select"]);

      const treeWithoutDistinct = new SyntaxTree(desc).deleteNode([
        ["select", 0],
        ["distinct", 0],
      ]);
      expect(steps[3].ast).toEqual(treeWithoutDistinct.toModel());

      expect(steps[3].description).toEqual({
        type: "select",
        expressions: [
          "veranst_termin.RAUM_ID",
          "veranstaltung.VERANSTALTUNG_BEZ",
          "veranst_termin.TERMIN_ID",
        ],
      });
    });

    //SELECT DISTINCT veranst_termin.RAUM_ID, veranstaltung.VERANSTALTUNG_BEZ, veranst_termin.TERMIN_ID
    //FROM veranstaltung
    //  INNER JOIN veranst_termin USING ('VERANSTALTUNG_ID')
    it("select with distinct", () => {
      const node = new SyntaxNode(steps[4].ast, undefined);
      expect(node.childrenCategoryNames.sort()).toEqual(["from", "select"]);

      expect(node.getChildInCategory("select").toModel()).toEqual(
        desc.children.select[0]
      );
      expect(node.getChildInCategory("from").toModel()).toEqual(
        desc.children.from[0]
      );

      expect(steps[4].description).toEqual({
        type: "distinct",
        expressions: [
          "veranst_termin.RAUM_ID",
          "veranstaltung.VERANSTALTUNG_BEZ",
          "veranst_termin.TERMIN_ID",
        ],
      });
    });
  });
});
