import { NodeDescription, Tree, Node } from "../syntaxtree";

interface SqlStepInnerJoinDescription {
  type: "inner";
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

interface SqlStepGroupByDescription {
  type: "groupBy";
  expressions: string[];
}

interface SqlStepOrderByDescription {
  type: "orderBy";
  expressions: string[];
}

export interface SqlStepDescription {
  ast: NodeDescription;
  description: SqlStepSelectDescription | SqlStepWhereDescription
  | SqlStepInnerJoinDescription | SqlStepOnDescription | SqlStepGroupByDescription
  | SqlStepOrderByDescription;
}


export function stepwiseSqlQuery(
  q: Tree | NodeDescription // Maybe decide which representation is most helpful
): SqlStepDescription[] {
  q = q instanceof Tree ? q : new Tree(q);
  // TODO: Transform

  if(q.isEmpty){
    // throwError?
    return [];
  }

  let arr: SqlStepDescription[] = [];
  //let starSelect: NodeDescription = createSelectNodeDescription();
  let t = new Tree({
    name: "querySelect",
    language: "sql",
    children: {
      select: [createSelectNodeDescription()],
      from: [
        {
          name: "from",
          language: "sql"
        }
      ]
    }
  });

  //first from table
  let table = q.locate([["from", 0], ["tables", 0]]);
  t = t.insertNode([["from", 0], ["tables", 0]], table.toModel());

  //cartesian product (cross join) if more then one table

  let joinNode = q.locateOrUndefined([["from", 0], ["joins", 0]]);
  let index = 0;
  while (joinNode != undefined) {
    // TODO distinguish between join types

    let joinTable = joinNode.getChildInCategory("table");

    // innerJoinOn -> innerJoin
    let typeName = joinNode.typeName == "innerJoinOn" ? "innerJoin" : joinNode.typeName;

    // maybe customizing existing Node more efficient then insert a new one ?
    t = t.insertNode([["from", 0], ["joins", index]],
      {
        name: typeName,
        language: joinNode.languageName,
        children: {
          table: [joinTable.toModel()]
        }
      }
    );

    arr.push({
      ast: t.toModel(),
      description: {
        type: "inner",
        tables: [table.properties.name, joinTable.properties.name]
      }
    });
    //console.log('join added');

    // 2. case innerJoinOn -  add the on-filter 
    let onNode = q.locateOrUndefined([["from", 0], ["joins", index], ["on", 0]]);
    if (onNode != undefined) {

      //change join name and add onNode
      t = t.replaceNode([["from", 0], ["joins", index]], joinNode.toModel());
      
      arr.push({
        ast: t.toModel(),
        description: {
          type: "on",
          expressions: collectExpressions(joinNode.getChildrenInCategory("on"))
        }
      });
      //console.log("after adding onNode: \n" + JSON.stringify(t.toModel(), undefined, 2));
    }
    joinNode = q.locateOrUndefined([["from", 0], ["joins", ++index]]);
  }

  //WHERE clause
  let whereNode = q.locateOrUndefined([["where", 0]]);
  if (whereNode != undefined) {
    t = t.insertNode([["where", 0]], whereNode.toModel());

    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "where",
        expressions: collectExpressions(whereNode.getChildrenInCategory("expressions"))
      }
    });
    //console.log("after where-step: \n" + JSON.stringify(t.toModel(), undefined, 2));
  }

  //GROUP BY clause
  let groupNode = q.locateOrUndefined([["groupBy", 0]]);
  if (groupNode != undefined) {
    t = t.insertNode([["groupBy", 0]], groupNode.toModel());

    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "groupBy",
        expressions: collectExpressions(groupNode.getChildrenInCategory("expressions"))
      }
    });
    //console.log('groupBy added');
  }

  // HAVING clause -> needed???

  //SELECT clause
  if (!(q.locate([["select", 0], ["columns", 0]]).typeName == "starOperator")) {
    t = t.replaceNode([["select", 0]], q.locate([["select", 0]]).toModel());
  } 

  arr.push({
    ast: t.rootNode.toModel(),
    description: {
      type: "select",
      expressions: collectExpressions(q.locate([["select", 0]]).children.columns)
    }
  });
  //console.log("after select-step: \n" + JSON.stringify(t.toModel(), undefined, 2));

  // TODO DISCTINCT ??

  //ORDER BY clause
  let orderByNode = q.locateOrUndefined([["orderBy", 0]]);
  if (orderByNode != undefined) {
    t = t.insertNode([["orderBy", 0]], orderByNode.toModel());

    arr.push({
      ast: t.rootNode.toModel(),
      description: {
        type: "orderBy",
        expressions: collectExpressions(orderByNode.getChildrenInCategory("expressions"))
      }
    });
    //console.log('orderBy added');
  }

  return arr;
}


function createSelectNodeDescription(): NodeDescription {
  return {
    name: "select",
    language: "sql",
    children: {
      columns: [
        {
          name: "starOperator",
          language: "sql"
        }
      ]
    }
  };
}

function collectExpressions(nodes: Node[]): string[] {
  // typedef "sql"."expression" ::= columnName | binaryExpression | constant | parameter | functionCall | parentheses
  let exp: string[] = [];
  
  for(let node of nodes){
  
    switch(node.typeName){
      case "binaryExpression": {
        exp = exp.concat(collectExpressions(node.getChildrenInCategory("lhs")));
        exp.push(node.getChildInCategory("operator").properties.operator);
        exp = exp.concat(collectExpressions(node.getChildrenInCategory("rhs")));
        break;
      }
      case "columnName": {
        exp.push(node.properties.refTableName + '.' + node.properties.columnName);
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
        exp.push(node.properties.name + "()");
        exp = exp.concat(collectExpressions(node.getChildrenInCategory("arguments")));
        break;
      }
      case "parentheses": {
        break;
      }
      // actually not an expression-type
      case "sortOrder": {
        // typename expression instead of expressions
        exp = exp.concat(collectExpressions(node.getChildrenInCategory("expression")));
        exp.push(node.properties.order);
        break;
      }
      case "starOperator": {
        exp.push("*");
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