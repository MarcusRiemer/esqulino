import {Component, Inject, OnInit} from '@angular/core'

import {Link}                      from '../../../../shared/page/widgets/index'

import {WIDGET_MODEL_TOKEN}        from '../../../editor.token'

@Component({
    templateUrl: 'app/editor/page/tree/widgets/templates/link.html',
})
export class LinkComponent {    
    constructor(@Inject(WIDGET_MODEL_TOKEN) public model : Link) {

    }

    /**
     * @return True, if this link has a target that could be shown.
     */
    get hasTarget() {
        const action = this.model.action;
        return (action.isExternal || (action.isInternal && action.isInternalPageResolveable));
    }

    /**
     * @return A user friendly name of the target
     */
    get targetName() {
        return (this.model.action.friendlyTargetName);
    }

    get targetIcon() {
        const action = this.model.action;

        if (action.isInternal && action.isInternalPageResolveable) {
            return ("fa-file-text-o");
        } else {
            return ("fa-external-link");
        }
    }

    /**
     * @return True, if this link resolves to an external URL
     */
    get isExternal() {
        return (this.model.action.isExternal);
    }

}
