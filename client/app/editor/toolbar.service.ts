import 'rxjs/Rx'

import {Injectable}             from 'angular2/core'

import {Observable}             from 'rxjs/Observable'
import {Observer}               from 'rxjs/Observer'


/**
 * Allows to adress the toolbar from any component.
 */
@Injectable()
export class ToolbarService {
    savingEnabled = false;

    constructor() {

    }
}
