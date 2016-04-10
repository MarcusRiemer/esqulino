import {Model}              from '../query.model'

import {
    Component
} from './common'

/**
 * The DELETE keyword is not assocatied with any data, at least in
 * SQLite.
 */
export class Delete extends Component {
    constructor(del : Model.Delete) {
        super();
    }

    toString() : string {
        return ("DELETE");
    }

    toModel() : Model.Delete {
        return ({});
    }

    get isComplete() : boolean {
        return (true);
    }
}
