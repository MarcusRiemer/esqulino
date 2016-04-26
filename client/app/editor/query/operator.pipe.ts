import {Pipe, PipeTransform}            from 'angular2/core'

import {Model}                          from '../../shared/query'

@Pipe({
    name : "operator",
    pure : true
})
export class OperatorPipe implements PipeTransform {
    public transform(value : Model.Operator, args : string[]) : any {
        switch(value) {
        case "<" : return ("&lt;");
        case "<=": return ("&le;");
        case "=" : return ("=");
        case ">=": return ("&ge;");
        case ">" : return ("&gt;");
        case "+" : return ("+");
        case "-" : return ("&minus;");
        case "*" : return ("&times;");
        case "/" : return ("&divide;");
        }
        return (value);
    }
}
