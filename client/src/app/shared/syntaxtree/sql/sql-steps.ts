import { NodeDescription, Tree } from "../syntaxtree";

interface SqlStepInnerJoinDescription {
  type: "inner";
  tables: string[];
}

interface SqlStepInnerWhereDescription {
  type: "inner";
  expressions: string[];
}

interface SqlStepDescription {
  ast: NodeDescription;
  description: SqlStepInnerJoinDescription | SqlStepInnerWhereDescription;
}

export function stepwiseSqlQuery(
  q: Tree | NodeDescription // Maybe decide which representation is most helpful
): SqlStepDescription[] {
  q = q instanceof Tree ? q : new Tree(q);
  // TODO: Transform

  return [];
}
