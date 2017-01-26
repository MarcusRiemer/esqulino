import * as Model                             from '../description'
import {ValidationResult}                     from '../validation'
import {Query}                                from '../base'

import {
    Component
} from './common'

/**
 * The DELETE keyword is not assocatied with any data, at least in
 * SQLite. This means that ths class is rather short.
 */
export class Delete extends Component {
    constructor(del : Model.Delete, query : Query) {
        super(query);
    }

    /**
     * @return The sole "DELETE" keyword.
     */
    toSqlString() : string {
        return ("DELETE");
    }

    /**
     * @return The description for DELETE is basically the top-level
     *         entry existing.
     */
    toModel() : Model.Delete {
        return ({});
    }

    /**
     * The DELETE keyword itself is always valid.
     */
    validate(schema : any) : ValidationResult {
        return (ValidationResult.VALID);
    }

    /**
     * There is only a single location something could go wrong in theory, but
     * in practice this shouldn't ever happen.
     */
    getLocationDescription() : string {
        return ("DELETE");
    }
}
