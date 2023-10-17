export type SelectorRoot = {
    type: "root", 
}

export type SelectorMatchLanguage =  { 
    type: "matchLanguage",
    language: string
}

export type Selector = SelectorRoot | SelectorMatchLanguage; 

function mkSelector() : Selector  {
    return {
        type: "matchLanguage", 
        language: "regex"
    }
}; 

const s = mkSelector(); 
if (s.type === "matchLanguage") {

}

// console.log(s.language); // Given an error. 