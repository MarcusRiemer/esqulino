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

function crossJoinTest(stepDesc: SqlStepDescription, desc: NodeDescription, childIndex: number){
  const node = new Node(stepDesc.ast, undefined);
  //console.log("crossJoinTest: \n" + JSON.stringify(node.toModel(), undefined, 2));

  expect(node.childrenCategoryNames).toEqual(
    ["select", "from"]
  );

  starSelectTest(stepDesc);

  const fromNode = node.getChildInCategory("from");
  expect(fromNode).toBeDefined();
  expect(fromNode.childrenCategoryNames).toEqual(["tables", "joins"]);

  //first table should equal to first table from the initial-query
  // TODO first table could be result table of a previous join
  expect(fromNode.getChildInCategory("tables").toModel()).toEqual(desc.children.from[0].children.tables[0]);

  //second (join) table
  expect(fromNode.getChildrenInCategory("joins").length).toEqual(childIndex+1);
  const joinNode = fromNode.getChildrenInCategory("joins")[childIndex];
  // joinNode without on
  expect(joinNode.childrenCategoryNames).toEqual(["table"]);
  // innerJoinOn -> innerJoin
  expect(joinNode.typeName).toEqual("innerJoin");
  expect(joinNode.getChildrenInCategory("table").length).toEqual(1);
  expect(joinNode.getChildInCategory("table").toModel()).toEqual(desc.children.from[0].children.joins[childIndex].children.table[0]);

  expect(stepDesc.description).toEqual(
    {
      type: "inner",
      tables: [fromNode.children.tables[0].properties.name, joinNode.children.table[0].properties.name]
    }
  );
}

function onNodeTest(stepDesc: SqlStepDescription, desc: NodeDescription, index: number) {
  const sourceTree = new Tree(desc);
  const node = new Node(stepDesc.ast, undefined);
  //console.log("checkOnNode: \n" + JSON.stringify(node.toModel(), undefined, 2));
  starSelectTest(stepDesc);

  expect(node.childrenCategoryNames).toEqual(
    ["select", "from"]
  );

  //maybe pass onNode as parameter
  const onNode = node.getChildInCategory("from").getChildrenInCategory("joins")[index].getChildInCategory("on");
  expect(onNode.toModel()).toEqual(desc.children.from[0].children.joins[index].children.on[0]);

  // TODO probably not generally applicable in function
  let lhs = sourceTree.locate([["from", 0], ["joins", index], ["on", 0], ["lhs",0]]);
  let rhs = sourceTree.locate([["from", 0], ["joins", index], ["on", 0], ["rhs",0]]);
  let operator = sourceTree.locate([["from", 0], ["joins", index], ["on", 0], ["operator",0]]);
  expect(stepDesc.description).toEqual(
    {
      type: "on",
      expressions: [lhs.properties.refTableName + '.' + lhs.properties.columnName, 
        operator.properties.operator, rhs.properties.refTableName + '.' + rhs.properties.columnName]
    }
  );
  
}

describe(`SQL Steps`, () => {
  it(`Empty Tree`, () => {
    expect(stepwiseSqlQuery(undefined)).toEqual([]);
    //expect(() => stepwiseSqlQuery(undefined)).toThrowError(/Empty Tree/);
  });

  it('Basic select-from, not breaking down', () => {
    const desc: NodeDescription = require('./spec/ast-40-select-from.json');
    const steps = stepwiseSqlQuery(desc);
    const node = new Node(steps[0].ast, undefined);

    expect(steps.length).toEqual(1);

    starSelectTest(steps[0]);
    expect(node.toModel()).toEqual(desc);

    expect(steps[0].description).toEqual(
      {
        type: "select",
        expressions: ["*"]
      }
    );
  });
});

describe(`simple where filter`, () => {
  const desc: NodeDescription = require('./spec/ast-41-select-from-where.json');
  const steps = stepwiseSqlQuery(desc);

  // first step containing a starSelect with the where-clause
  it('first step', () => {
    expect(steps.length).toEqual(2);

    const node = new Node(steps[0].ast, undefined);
    expect(node.childrenCategoryNames).toEqual(
      ["select", "from", "where"]
    );

    starSelectTest(steps[0]);

    expect(node.getChildInCategory("where").toModel()).toEqual(desc.children.where[0]);

    expect(steps[0].description).toEqual(
      {
        type: "where",
        expressions: ["adresse.LKZ", "<>", "D"]
      }
    );
  });

  //second step containing the fields from the select-clause and the where-clause
  it('second step', () => {
    const node = new Node(stepwiseSqlQuery(desc)[1].ast, undefined);
    expect(node.childrenCategoryNames).toEqual(
      ["select", "from", "where"]
    );
    // fields from select should correspond to initial-query
    expect(node.getChildInCategory("select").toModel()).toEqual(desc.children.select[0]);

    //where should correspond to initial-query----- maybe redundant?
    expect(node.getChildInCategory("where").toModel()).toEqual(desc.children.where[0]);

    expect(steps[1].description).toEqual(
      {
        type: "select",
        expressions: ["termin.TAG"]
      }
    );
  });
});


describe("simple join", () => {
  const desc: NodeDescription = require('./spec/ast-42-simple-join.json');
  const steps = stepwiseSqlQuery(desc);

  //first step containing a starSelect with the join-clause
  it('first step: cross join', () => {
    expect(steps.length).toEqual(3);
    crossJoinTest(steps[0], desc, 0);
  });

  //second step containing the join with the on-clouse
  it('second step: on-clouse', () => {
    onNodeTest(steps[1], desc, 0);
  });

  it('third step: fields from the select-clause', () => {
    expect(steps[2].ast).toEqual(desc);

    expect(steps[2].description).toEqual(
      {
        type: "select",
        expressions: ["Charakter.Charakter_Name"]
      }
    );
  });
});

describe("query with join,group,order", () => {
  const desc: NodeDescription = require('./spec/ast-43-join-group-order.json');
  const steps = stepwiseSqlQuery(desc);

  //first step containing a starSelect with the join-clause
  it('first step: cross join', () => {
    expect(steps.length).toEqual(5);

    crossJoinTest(steps[0], desc, 0);
  });

  //second step containing the join with the on-clouse
  it('second step: on-clouse', () => {
    onNodeTest(steps[1], desc, 0);
  });

  //third step containing the groupBy-clouse
  it('third step: groupBy-clouse', () => {
    expect(steps[2]).toBeDefined();
    const node = new Node(steps[2].ast, undefined);
    starSelectTest(steps[2]);
    // TODO test from ?
    expect(node.childrenCategoryNames).toEqual(["select", "from", "groupBy"]);
    expect(node.getChildInCategory("groupBy").toModel()).toEqual(desc.children.groupBy[0]);

    expect(steps[2].description).toEqual(
      {
        type: "groupBy",
        expressions: ["Charakter.Charakter_ID"]
      }
    );
  });

  it('fourth step: select-clause', () => {
    //TODO test the other nodes ?
    const node = new Node(steps[3].ast, undefined);
    expect(node.childrenCategoryNames.sort()).toEqual(["from", "groupBy", "select"]);

    // contain all select fields
    expect(node.getChildInCategory("select").toModel()).toEqual(desc.children.select[0]);

    expect(steps[3].description).toEqual(
      {
        type: "select",
        expressions: ["COUNT()", "Charakter.Charakter_Name"]
      }
    );
  });

  it('fifth step: orderBy-clause', () => {
    expect(steps[4]).toBeDefined();
    const node = new Node(steps[4].ast, undefined);
 
    // TODO test from ?
    expect(node.childrenCategoryNames.sort()).toEqual(["from", "groupBy", "orderBy", "select"]);
    expect(node.getChildInCategory("orderBy").toModel()).toEqual(desc.children.orderBy[0]);

    // only this enough?
    expect(node.toModel()).toEqual(desc);

    expect(steps[4].description).toEqual(
      {
        type: "orderBy",
        expressions: ["COUNT()", "DESC", "Charakter.Charakter_Name"]
      }
    );
  });

});

describe("two inner-joins", () => {
  /*
  SELECT Charakter.Charakter_Name, Geschichte.Geschichte_Name
    FROM Charakter
	INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
	INNER JOIN Geschichte ON Auftritt.Geschichte_ID = Geschichte.Geschichte_ID*/
  const desc: NodeDescription = require('./spec/ast-44-two-inner-joins.json');
  const steps = stepwiseSqlQuery(desc);
  
    /*
    SELECT *
      FROM Charakter
    INNER JOIN Auftritt 
  */
  it('first step: cross-join', () => { 
    expect(steps.length).toEqual(5);
    crossJoinTest(steps[0], desc, 0);
  });

   //second step containing the join with the on-clouse
   /* 
    SELECT *
      FROM Charakter
	  INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
   */
   it('second step: on-filter', () => {

    //const node = new Node(steps[1].ast, undefined);
    onNodeTest(steps[1], desc, 0);
  });

    /*
    SELECT *
      FROM Charakter
	  INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    INNER JOIN Geschichte 
    */
  it('third step: second inner join', () => {
    //const node = new Node(steps[2].ast, undefined);
    //console.log("checkOnNode: \n" + JSON.stringify(node.toModel(), undefined, 2));
    crossJoinTest(steps[2], desc, 1);

  });

      /*
    SELECT *
      FROM Charakter
	  INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    INNER JOIN Geschichte ON Auftritt.Geschichte_ID = Geschichte.Geschichte_ID
    */
   it('fourth step: second inner join with on-filter', () => {
    //const node = new Node(steps[2].ast, undefined);
    //console.log("checkOnNode: \n" + JSON.stringify(node.toModel(), undefined, 2));
    onNodeTest(steps[3], desc, 1);

  });

      /*
    SELECT Charakter.Charakter_Name, Geschichte.Geschichte_Name
      FROM Charakter
	  INNER JOIN Auftritt ON Auftritt.Charakter_ID = Charakter.Charakter_ID
    INNER JOIN Geschichte ON Auftritt.Geschichte_ID = Geschichte.Geschichte_ID*/
    it('fifth step: fields from the select-clause', () => {
      //TODO test the other nodes ?
      const node = new Node(steps[4].ast, undefined);
      expect(node.childrenCategoryNames.sort()).toEqual(["from", "select"]);
  
      // contain all select fields
      expect(node.getChildInCategory("select").toModel()).toEqual(desc.children.select[0]);
  
      // only this enough?
      expect(node.toModel()).toEqual(desc);

      expect(steps[4].description).toEqual(
        {
          type: "select",
          expressions: ["Charakter.Charakter_Name", "Geschichte.Geschichte_Name"]
        }
      );
    });
});

// next: test outer-join


