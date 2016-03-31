import 'rxjs/Rx'

import {Injectable}                              from 'angular2/core'

/**
 * Allows to adress the toolbar from any component.
 */
@Injectable()
export class ToolbarService {
    savingEnabled = false;
}
