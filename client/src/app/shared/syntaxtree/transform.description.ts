import { NodeDescription } from "./syntaxtree.description";

export type Selector = {
    type: string, 
    language?: string, 
    nodeName?: string, 
}

/* General Selectors */
export type SelectorRoot = {
    type: "root", 
}

/* Is this selector really needed? Why not just match against language? 

export type SelectorMatchLanguage =  { 
    type: "matchLanguage",
    language: string
} */

/* Language Specific Selectors */
/* In this case, for the regex language */


const SelectorChar : Selector = {
  type: "char", 
  language: "regex", 
  nodeName: "char",
}

/* Matching Interface*/

type PropertyCheck = {
  propertyName: string, 
  checkPropertyFunc?: (propertyValue: string) => boolean ,
}

export interface Matching {
  selector: Selector,
  // TODO: Maybe implementing here propertyCheck and childCheck is a good idea? 
  // This implies creating the selectors as constants for every needed case and then filtering further
  // based on the propertyCheck and childCheck definitions.
  propertyCheck?: PropertyCheck[],
  // ChildCheck: NodeDescription[],
  transform: MatchingTransform,
}

type MatchingTransform = {
  type: "replace",
  matched: NodeDescription,
  transformation: Function, //TODO: how to most generally defined a transformation with holes
};

const dummyMatched : NodeDescription = {
  name: "", 
  language: "",
};

/* Defining the Patterns and their respective transformations */

const multiValuedCharMatching : Matching = {
  selector : SelectorChar,
  propertyCheck: [
    {
      // Check that the property with the given propertyName exists
      propertyName: "value", 
      // Check that the value property has more than one character
      checkPropertyFunc: (inp) => {
        // TODO: Add checks for the escaped chacacters and transform those appropriately
        return inp.length > 1; 
      }
    } 
  ],
  transform : {
    type: "replace",
    matched : dummyMatched,
    transformation:  (matched: NodeDescription) => {
      return {
        language: matched.language,
        name: "invis-container", 
        children: {
          nodes: Function.apply(() => {
            let multivaluedChars = matched.properties["value"];
            let result : NodeDescription[] = multivaluedChars.split("").map((char : string) => {
              return {
                language : matched.language, 
                name : "char", 
                properties: 
                {
                    value: char,
                },
              };
           });
           return result;
          }),
      }
    }
  }
}
}

// console.log(s.language); // Given an error.