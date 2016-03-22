import 'rxjs/Rx';

import {Observable}             from 'rxjs/Observable'
import {Injectable}             from 'angular2/core';

/**
 * The scopes a drag event could affect
 */
enum SqlScope {
    Select,
    From,
    Where,
    GroupBy,
    Having,
    OrderBy,
    Expression
}

/**
 * Abstract information about the drag event.
 */
interface SqlDragEvent {
    scope : SqlScope
}

@Injectable()
class DragService {
    private _source : Observable<SqlDragEvent>;

    constructor() {
        this._source = Observable.create();
    }

    fireEvent(dragEvent : SqlDragEvent) {

    }
}
