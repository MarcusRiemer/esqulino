import {
    Model, Query, ValidationResult
} from '../query'

import {
    Component
} from './common'

/**
 * The DELETE keyword is not assocatied with any data, at least in
 * SQLite.
 */
export class Delete extends Component {
    constructor(del : Model.Delete, query : Query) {
        super(query);
    }

    toString() : string {
        return ("DELETE");
    }

    toModel() : Model.Delete {
        return ({});
    }

    validate(schema : any) : ValidationResult {
        return (ValidationResult.VALID);
    }
}
