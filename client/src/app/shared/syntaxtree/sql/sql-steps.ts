import { NodeDescription, Tree, Node } from "../syntaxtree";

export type JoinType =
  | "crossJoin"
  | "innerJoin"
  | "innerJoinOn"
  | "innerJoinUsing"
  | "outerJoin"
  | "leftOuterJoin"
  | "leftOuterJoinOn"
  | "leftOuterJoinUsing"
  | "rightOuterJoin"
  | "rightOuterJoinOn"
  | "rightOuterJoinUsing";

export interface SqlStepJoinDescription {
  type: JoinType;
  tables: string[];
}

export interface SqlStepConditionFilterDescription {
  type: "on" | "using" | "where";
  expressions: string[];
  explainAst: NodeDescription;
  columnNames: string[];
}

export interface SqlStepGroupByDescription {
  type: "groupBy";
  expressions: string[];
  correspondingOrderBy: NodeDescription;
}

interface SqlStepSelectDescription {
  type: "select";
  expressions: string[];
}

interface SqlStepOrderByDescription {
  type: "orderBy";
  expressions: string[];
}

export interface SqlStepDescription {
  ast: NodeDescription;
  description:
    | SqlStepJoinDescription
    | SqlStepConditionFilterDescription
    | SqlStepSelectDescription
    | SqlStepGroupByDescription
    | SqlStepOrderByDescription;
}

function createBaseTree(): Tree {
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

export function stepwiseSqlQuery(q: Tree): SqlStepDescription[] {
  if (!q || q.isEmpty) {
    // throwError?
    return [];
  }

  let arr: SqlStepDescription[] = [];
  let t = createBaseTree();

  // cross joins of comma separated tables in from clause
  let from = q.locate([["from", 0]]);
  let tableIndex = 1;
  let currentTable = from.getChildrenInCategory("tables")[0];
  let desc_firstTableName = currentTable.properties.name;
  t = t.insertNode(
    [
      ["from", 0],
      ["tables", 0],
    ],
    currentTable.toModel()
  );
  let nextTable = from.getChildrenInCategory("tables")[tableIndex];
  while (nextTable) {
    if (tableIndex == 2) {
      desc_firstTableName = "Zwischentabelle";
    }

    t = t.insertNode(
      [
        ["from", 0],
        ["tables", tableIndex],
      ],
      nextTable.toModel()
    );

    arr.push({
      ast: t.toModel(),
      description: {
        type: "crossJoin",
        tables: [desc_firstTableName, nextTable.properties.name],
      },
    });

    currentTable = nextTable;
    nextTable = from.getChildrenInCategory("tables")[++tableIndex];
  }

  //cartesian product (cross join) if more then one table
  let join = q.locateOrUndefined([
    ["from", 0],
    ["joins", 0],
  ]);
  let index = 0;

  while (join) {
    // TODO find suitable name for a virtual table
    // firstTableName = firstTableName + "CROSS JOIN" + joinTable.properties.name;
    desc_firstTableName = index > 0 ? "Zwischentabelle" : desc_firstTableName;
    let joinTable = join.getChildInCategory("table");

    t = t.insertNode(
      [
        ["from", 0],
        ["joins", index],
      ],
      {
        name: "crossJoin",
        language: join.languageName,
        children: {
          table: [joinTable.toModel()],
        },
      }
    );

    arr.push({
      ast: t.toModel(),
      description: {
        type: "crossJoin",
        tables: [desc_firstTableName, joinTable.properties.name],
      },
    });

    let joinFilterType = join.typeName.toLowerCase().includes("using")
      ? "using"
      : "on";

    let joinFilter = q.locateOrUndefined([
      ["from", 0],
      ["joins", index],
      [joinFilterType, 0],
    ]);

    if (joinFilter) {
      let joinType = joinFilterType == "on" ? "innerJoinOn" : "innerJoinUsing";

      //replace cross -> inner join with filter
      let desc = join.toModel();
      desc.name = joinType;

      // important for inserting at filter
      let descBeforeFilter = t.toModel();

      t = t.replaceNode(
        [
          ["from", 0],
          ["joins", index],
        ],
        desc
      );

      //why type doesnt accept var joinFilterType ?
      arr.push({
        ast: t.toModel(),
        description: {
          type: join.typeName.toLowerCase().includes("using") ? "using" : "on",
          expressions: collectExpressions(
            join.getChildrenInCategory(joinFilterType)
          ),
          explainAst: descBeforeFilter,
          columnNames: collectColumnNames(join.toModel()),
        },
      });
      //console.log("after adding filter node: " + index + "\n" + JSON.stringify(t.toModel(), undefined, 2));
    }

    // outer join approach - just run the outer join -> maybe add null rows with union?
    if (join.typeName.toLowerCase().includes("outer")) {
      t = t.replaceNode(
        [
          ["from", 0],
          ["joins", index],
        ],
        join.toModel()
      );

      arr.push({
        ast: t.toModel(),
        description: {
          //type: "outerJoin",
          type: join.typeName as JoinType,
          tables: [desc_firstTableName, joinTable.properties.name],
        },
      });
    }
    join = q.locateOrUndefined([
      ["from", 0],
      ["joins", ++index],
    ]);
    //console.log("after adding outer node: " + index + "\n" + JSON.stringify(t.toModel(), undefined, 2));
  }

  //WHERE clause
  let whereNode = q.locateOrUndefined([["where", 0]]);
  if (whereNode) {
    let descBeforeFilter = t.toModel();
    t = t.insertNode([["where", 0]], whereNode.toModel());

    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "where",
        expressions: collectExpressions(
          whereNode.getChildrenInCategory("expressions")
        ),
        explainAst: descBeforeFilter,
        columnNames: collectColumnNames(whereNode.toModel()),
      },
    });
  }

  //GROUP BY clause - transform group by to an order by
  let groupNode = q.locateOrUndefined([["groupBy", 0]]);
  if (groupNode) {
    t = t.insertNode([["groupBy", 0]], groupNode.toModel());

    let groupByTransformDesc = groupNode.toModel();
    // transform a groupNode to an orderBy node
    groupByTransformDesc.name = "orderBy";

    let withOrderBy = t.deleteNode([["groupBy", 0]]);
    withOrderBy = withOrderBy.insertNode(
      [["orderBy", 0]],
      groupByTransformDesc
    );

    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "groupBy",
        expressions: collectExpressions(
          groupNode.getChildrenInCategory("expressions")
        ),
        correspondingOrderBy: withOrderBy.toModel(),
      },
    });
    //console.log("goupBy transform description: " + JSON.stringify(groupTree.toModel(), undefined, 2));
  }

  //SELECT clause
  let select = q.locate([["select", 0]]);
  if (
    !(
      q.locate([
        ["select", 0],
        ["columns", 0],
      ]).typeName == "starOperator"
    )
  ) {
    t = t.replaceNode([["select", 0]], select.toModel());
  }

  arr.push({
    ast: t.rootNode.toModel(),
    description: {
      type: "select",
      expressions: collectExpressions(select.children.columns),
    },
  });
  //console.log("after select-step: \n" + JSON.stringify(t.toModel(), undefined, 2));

  // TODO DISCTINCT

  //ORDER BY clause
  let orderByNode = q.locateOrUndefined([["orderBy", 0]]);
  if (orderByNode) {
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
        // ignore parentheses
        exp.push(
          //  "(" +
          collectExpressions(
            node.getChildrenInCategory("expression")
          ).toString()
          //  + ")"
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

function collectColumnNames(nodeDesc: NodeDescription): string[] {
  // if join type is 'using' - return constant value
  let t = new Tree(nodeDesc);
  if (nodeDesc.name.includes("Using")) {
    return [
      t.locate([["using", 0]]).getChildInCategory("expression").properties
        .value,
    ];
  }

  let all: Node[] = t.getNodesOfType({
    typeName: "columnName",
    languageName: "sql",
  });
  return all.map((node) => node.properties.columnName);
}
