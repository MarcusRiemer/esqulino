import { NodeDescription, SyntaxTree, SyntaxNode } from "../syntaxtree";

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

interface SqlStepFromDescripton {
  type: "from";
  table: string;
}

export interface SqlStepConditionFilterDescription {
  type: "on" | "using" | "where";
  expressions: string[];
  columnNames: string[];
}

export interface SqlStepGroupByDescription {
  type: "groupBy";
  expressions: string[];
}

interface SqlStepSelectDescription {
  type: "select";
  expressions: string[];
}

interface SqlStepOrderByDescription {
  type: "orderBy";
  expressions: string[];
}

interface SqlStepDistinctDescription {
  type: "distinct";
  expressions: string[];
}

export interface SqlStepDescription {
  ast: NodeDescription;
  description:
    | SqlStepFromDescripton
    | SqlStepJoinDescription
    | SqlStepConditionFilterDescription
    | SqlStepSelectDescription
    | SqlStepDistinctDescription
    | SqlStepGroupByDescription
    | SqlStepOrderByDescription;
}

function createBaseTree(): SyntaxTree {
  return new SyntaxTree({
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

export function stepwiseSqlQuery(q: SyntaxTree): SqlStepDescription[] {
  if (!q || q.isEmpty) {
    return [];
  }

  let arr: SqlStepDescription[] = [];
  let t = createBaseTree();

  // get first table as first step
  let from = q.locate([["from", 0]]);

  let currentTable = from.getChildrenInCategory("tables")[0];
  let desc_firstTableName = currentTable.properties.name;
  t = t.insertNode(
    [
      ["from", 0],
      ["tables", 0],
    ],
    currentTable.toModel()
  );

  arr.push({
    ast: t.toModel(),
    description: {
      type: "from",
      table: desc_firstTableName,
    },
  });

  // cross joins of comma separated tables in from clause
  let tableIndex = 1;
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

      //replace cross to an inner join with filter
      let desc = join.toModel();
      desc.name = joinType;

      t = t.replaceNode(
        [
          ["from", 0],
          ["joins", index],
        ],
        desc
      );

      arr.push({
        ast: t.toModel(),
        description: {
          type: join.typeName.toLowerCase().includes("using") ? "using" : "on",
          expressions: collectExpressions(
            join.getChildrenInCategory(joinFilterType)
          ),
          columnNames: collectColumnNames(join.toModel()),
        },
      });
      //console.log("after adding filter node: " + index + "\n" + JSON.stringify(t.toModel(), undefined, 2));
    }

    // outer join approach - just run the outer join
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
          type: join.typeName as JoinType,
          tables: [desc_firstTableName, joinTable.properties.name],
        },
      });
    }
    join = q.locateOrUndefined([
      ["from", 0],
      ["joins", ++index],
    ]);
  }

  //WHERE clause
  let whereNode = q.locateOrUndefined([["where", 0]]);
  if (whereNode) {
    t = t.insertNode([["where", 0]], whereNode.toModel());

    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "where",
        expressions: collectExpressions(
          whereNode.getChildrenInCategory("expressions")
        ),
        columnNames: collectColumnNames(whereNode.toModel()),
      },
    });
  }

  //GROUP BY clause - transform group by to an order by
  let groupNode = q.locateOrUndefined([["groupBy", 0]]);
  if (groupNode) {
    t = t.insertNode([["groupBy", 0]], groupNode.toModel());

    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "groupBy",
        expressions: collectExpressions(
          groupNode.getChildrenInCategory("expressions")
        ),
      },
    });
  }

  //SELECT clause
  let select = q.locate([["select", 0]]);
  /* if (
    !(
      q.locate([
        ["select", 0],
        ["columns", 0],
      ]).typeName == "starOperator"
    )
  ) { */
  if (t.locate([["select", 0]]) != select) {
    t = t.replaceNode([["select", 0]], select.toModel());
  }

  let distinct = q.locateOrUndefined([
    ["select", 0],
    ["distinct", 0],
  ]);
  let expr = collectExpressions(select.children.columns);
  if (distinct) {
    t = t.deleteNode(distinct.location);
  }
  arr.push({
    ast: t.rootNode.toModel(),
    description: {
      type: "select",
      expressions: expr,
    },
  });
  if (distinct) {
    t = t.insertNode(distinct.location, distinct.toModel());
    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "distinct",
        expressions: expr,
      },
    });
  }

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

/**
 * Collects all expressions of nodes and returns them as an string array
 * @param nodes
 */
function collectExpressions(nodes: SyntaxNode[]): string[] {
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
      }
    }
  }
  return exp;
}

/**
 * collects all columnNames of a NodeDescription
 * @param nodeDesc
 */
function collectColumnNames(nodeDesc: NodeDescription): string[] {
  // if join type is 'using' - return [usingValue, table.usingValue]
  let t = new SyntaxTree(nodeDesc);
  if (nodeDesc.name.includes("Using")) {
    let name = t.locate([["using", 0]]).getChildInCategory("expression")
      .properties.value;

    return [name, t.locate([["table", 0]]).properties.name + "." + name];
  }

  let all: SyntaxNode[] = t.getNodesOfType({
    typeName: "columnName",
    languageName: "sql",
  });
  return all.map(
    (node) => node.properties.refTableName + "." + node.properties.columnName
  );
}
