grammar "regex" {
    node "char" {
        prop "value" string
    };
    node "quantifier" {
        children "contains" ::= (char)+
        prop "symbol" string {
          enum "*" "+" "?"
        }
    }; 
    node "alternation" {
        children "alternatives" allowed "|" ::= (container)+
    };
    typedef "elem" ::= char | quantifier | alternation; 
    node "container" {
        children "elements" allowed ::= container? & elem* & container?
    }; 
    root = container;
}
