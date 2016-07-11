import {Injectable}                     from '@angular/core'

export interface PaneOrder {
    navbar : number,
    sidebar : number,
    content : number
}

/**
 * Allows access to user preferences.
 */
@Injectable()
export class PreferencesService {
    get paneOrder() : PaneOrder {
        return ({
            navbar: 0,
            sidebar: 2,
            content: 1
        })
    }

    get showJsonModel() : boolean {
        return (false);
    }
}
