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
  matched: MatchedPattern,
  transformation: NodeDescription, //TODO: how to most generally defined a holed transformation
};


const dummyNode : NodeDescription = {
  name: "", 
  language: "",
}

// This is basically a wrapper of NodeDescription. I was not sure how to calculate 
// the values from within the const definition, that is why I tried this way. 
// Sadly it doesn't work like this either. 
// Could I give my transform a new type that allows for callable functions for 
// defining attributes on the fly after a match has been found? 

class MatchedPattern {
  private m_NodeDescription : NodeDescription; 
  constructor(matchedNodeDesc: NodeDescription) {
    this.m_NodeDescription = matchedNodeDesc; 
  }

  public getLanguage() {
    return this.m_NodeDescription.language;
  };

  public getNodeName() {
    return this.m_NodeDescription.name; 
  };

  public getChildren () {
    return this.m_NodeDescription.children;
  }; 

  public getProperties () {
    return this.m_NodeDescription.properties;
  }; 
}

const dummyMatched = new MatchedPattern(dummyNode); 


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
    transformation:  {
      language: (matched: MatchedPattern) => {return matched.getLanguage();},
      name: "invis-container", 
      children: {
          nodes: (matched:MatchedPattern) => {
            let multivaluedChars = matched.getProperties()["value"];
            let result : NodeDescription[] = multivaluedChars.split("").map((char : string) => {
              return {
                language : matched.getLanguage(), 
                name : "char", 
                properties: 
                {
                    value: char,
                },
              };
           });
           return result;
          }
      }
    }
  }
}

// console.log(s.language); // Given an error.