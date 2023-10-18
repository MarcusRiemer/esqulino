import { NodeDescription } from "./syntaxtree.description";

 

export interface Matching {
  selector: MatchingSelector;
  transform: MatchingTransform;
}

 

type MatchingSelector =
  | {
      type: "exactMatch";
      languageName: string;
      typeName: string;
    }
  | {
      type: "hasChildOfType";
    };

 

type MatchingTransform = {
  type: "replace";
  newNode: NodeDescription;
  childRule: "ignore-children" | "copy-children";
  renameChildGroupRule: 
};