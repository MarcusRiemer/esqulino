import { NodeDescription, Tree, Node } from "../syntaxtree";

interface SqlStepCrossJoinDescription {
  type: "cross";
  tables: string[];
}

interface SqlStepInnerJoinDescription {
  type: "inner";
  tables: string[];
}

interface SqlStepOuterJoinDescription {
  type: "outer";
  tables: string[];
}

interface SqlStepSelectDescription {
  type: "select";
  expressions: string[];
}

interface SqlStepWhereDescription {
  type: "where";
  expressions: string[];
}

interface SqlStepOnDescription {
  type: "on";
  expressions: string[];
}

interface SqlStepUsingDescription {
  type: "using";
  expressions: string[];
}

interface SqlStepGroupByDescription {
  type: "groupBy";
  expressions: string[];
  groupByEntriesDescription: NodeDescription;
}

interface SqlStepOrderByDescription {
  type: "orderBy";
  expressions: string[];
}

export interface SqlStepDescription {
  ast: NodeDescription;
  description:
    | SqlStepCrossJoinDescription
    | SqlStepSelectDescription
    | SqlStepWhereDescription
    | SqlStepInnerJoinDescription
    | SqlStepOnDescription
    | SqlStepGroupByDescription
    | SqlStepOrderByDescription
    | SqlStepUsingDescription
    | SqlStepOuterJoinDescription;
}

function createInitTree(): Tree {
  return new Tree({
    name: "querySelect",
    language: "sql",
    children: {
      select: [
        {
          name: "select",
          language: "sql",
          children: {
            columns: [
              {
                name: "starOperator",
                language: "sql",
              },
            ],
          },
        },
      ],
      from: [
        {
          name: "from",
          language: "sql",
        },
      ],
    },
  });
}

export function stepwiseSqlQuery(
  q: Tree | NodeDescription // Maybe decide which representation is most helpful
): SqlStepDescription[] {
  q = q instanceof Tree ? q : new Tree(q);

  if (q.isEmpty) {
    // throwError?
    return [];
  }

  let arr: SqlStepDescription[] = [];
  let t = createInitTree();

  //first from table
  let table = q.locate([
    ["from", 0],
    ["tables", 0],
  ]);
  t = t.insertNode(
    [
      ["from", 0],
      ["tables", 0],
    ],
    table.toModel()
  );

  //cartesian product (cross join) if more then one table
  let srcJoinNode = q.locateOrUndefined([
    ["from", 0],
    ["joins", 0],
  ]);
  let index = 0;
  let firstTableName = table.properties.name;

  while (srcJoinNode != undefined) {
    firstTableName = index > 0 ? "Zwischentabelle" : firstTableName;
    let joinTable = srcJoinNode.getChildInCategory("table");

    t = t.insertNode(
      [
        ["from", 0],
        ["joins", index],
      ],
      {
        name: "crossJoin",
        language: srcJoinNode.languageName,
        children: {
          table: [joinTable.toModel()],
        },
      }
    );

    arr.push({
      ast: t.toModel(),
      description: {
        type: "cross",
        tables: [firstTableName, joinTable.properties.name],
      },
    });
    // TODO decide description-format for UI
    // firstTableName = firstTableName + "CROSS JOIN" + joinTable.properties.name;

    let joinFilterType = srcJoinNode.typeName.toLowerCase().includes("using")
      ? "using"
      : "on";
    let joinFilterNode = q.locateOrUndefined([
      ["from", 0],
      ["joins", index],
      [joinFilterType, 0],
    ]);

    if (joinFilterNode != undefined) {
      let newName = joinFilterType == "on" ? "innerJoinOn" : "innerJoinUsing";
      let newDesc: NodeDescription = undefined;

      //    tree.setProperty ??

      if (joinFilterType == "on") {
        newDesc = {
          name: newName,
          language: "sql",
          children: {
            table: [joinTable.toModel()],
            on: [joinFilterNode.toModel()],
          },
        };
      } else {
        newDesc = {
          name: newName,
          language: "sql",
          children: {
            table: [joinTable.toModel()],
            using: [joinFilterNode.toModel()],
          },
        };
      }
      //change crossJoin to InnerJoin and add filterNode
      t = t.replaceNode(
        [
          ["from", 0],
          ["joins", index],
        ],
        newDesc
      );

      arr.push({
        ast: t.toModel(),
        description: {
          type: srcJoinNode.typeName.toLowerCase().includes("using")
            ? "using"
            : "on",
          expressions: collectExpressions(
            srcJoinNode.getChildrenInCategory(joinFilterType)
          ),
        },
      });
      //firstTableName = firstTableName + joinType + onExpression;
      //console.log("after adding filter node: \n" + JSON.stringify(t.toModel(), undefined, 2));
    }

    // if outer join - add null rows
    //console.log("debug typename: " + index + srcJoinNode.typeName);
    if (srcJoinNode.typeName.toLowerCase().includes("outer")) {
      t = t.replaceNode(
        [
          ["from", 0],
          ["joins", index],
        ],
        srcJoinNode.toModel()
      );

      arr.push({
        ast: t.toModel(),
        description: {
          type: "outer",
          tables: [firstTableName, joinTable.properties.name],
        },
      });
    }
    srcJoinNode = q.locateOrUndefined([
      ["from", 0],
      ["joins", ++index],
    ]);
  }

  //WHERE clause
  let whereNode = q.locateOrUndefined([["where", 0]]);
  if (whereNode != undefined) {
    t = t.insertNode([["where", 0]], whereNode.toModel());

    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "where",
        expressions: collectExpressions(
          whereNode.getChildrenInCategory("expressions")
        ),
      },
    });
  }

  //GROUP BY clause
  // TODO - how to display groups in the ui ???
  // must be a own query
  // current approach - transform group by node to an order by node
  let groupNode = q.locateOrUndefined([["groupBy", 0]]);
  if (groupNode != undefined) {
    t = t.insertNode([["groupBy", 0]], groupNode.toModel());

    // TODO develop transform for displaying group entries in UI
    let groupByTransformDesc = groupNode.toModel();
    // transform a groupNode to an orderBy node
    groupByTransformDesc.name = "orderBy";

    let groupTree = t.deleteNode([["groupBy", 0]]);
    groupTree = groupTree.insertNode([["orderBy", 0]], groupByTransformDesc);

    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "groupBy",
        expressions: collectExpressions(
          groupNode.getChildrenInCategory("expressions")
        ),
        groupByEntriesDescription: groupTree.toModel(),
      },
    });
    //console.log("goupBy transform description: " + JSON.stringify(groupTree.toModel(), undefined, 2));
  }

  // HAVING clause -> needed???

  //SELECT clause
  if (
    !(
      q.locate([
        ["select", 0],
        ["columns", 0],
      ]).typeName == "starOperator"
    )
  ) {
    t = t.replaceNode([["select", 0]], q.locate([["select", 0]]).toModel());
  }

  arr.push({
    ast: t.rootNode.toModel(),
    description: {
      type: "select",
      expressions: collectExpressions(
        q.locate([["select", 0]]).children.columns
      ),
    },
  });
  //console.log("after select-step: \n" + JSON.stringify(t.toModel(), undefined, 2));

  // TODO DISCTINCT needed??

  //ORDER BY clause
  let orderByNode = q.locateOrUndefined([["orderBy", 0]]);
  if (orderByNode != undefined) {
    t = t.insertNode([["orderBy", 0]], orderByNode.toModel());

    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "orderBy",
        expressions: collectExpressions(
          orderByNode.getChildrenInCategory("expressions")
        ),
      },
    });
  }

  return arr;
}

function collectExpressions(nodes: Node[]): string[] {
  // typedef "sql"."expression" ::= columnName | binaryExpression | constant | parameter | functionCall | parentheses
  let exp: string[] = [];

  for (let node of nodes) {
    switch (node.typeName) {
      case "binaryExpression": {
        exp.push(
          collectExpressions(node.getChildrenInCategory("lhs")).toString() +
            " " +
            node.getChildInCategory("operator").properties.operator +
            " " +
            collectExpressions(node.getChildrenInCategory("rhs")).toString()
        );
        break;
      }
      case "columnName": {
        exp.push(
          node.properties.refTableName + "." + node.properties.columnName
        );
        break;
      }
      case "constant": {
        exp.push(node.properties.value);
        break;
      }
      case "parameter": {
        break;
      }
      case "functionCall": {
        exp.push(
          node.properties.name +
            "(" +
            collectExpressions(
              node.getChildrenInCategory("arguments")
            ).toString() +
            ")"
        );
        break;
      }
      case "parentheses": {
        exp.push(
          "(" +
            collectExpressions(
              node.getChildrenInCategory("expression")
            ).toString() +
            ")"
        );
        break;
      }
      // actually not an expression-types
      case "sortOrder": {
        exp.push(
          collectExpressions(
            node.getChildrenInCategory("expression")
          ).toString() +
            " " +
            node.properties.order
        );
        break;
      }
      case "starOperator": {
        exp.push("*");
        break;
      }
      case "whereAdditional": {
        exp.push(node.properties.operator);
        exp = exp.concat(
          collectExpressions(node.getChildrenInCategory("expression"))
        );
        break;
      }
      default: {
        console.log("default case should not appear: " + node.typeName);
        //return [];
      }
    }
  }
  //console.log("return exp:\n" + exp);
  return exp;
}
