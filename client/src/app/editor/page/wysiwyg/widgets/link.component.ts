import {Component, Inject, OnInit}    from '@angular/core'

import {Link}                         from '../../../../shared/page/widgets/index'

import {SidebarService}               from '../../../sidebar.service'
import {RegistrationService}          from '../../../registration.service'
import {WIDGET_MODEL_TOKEN}           from '../../../editor.token'

import {WidgetComponent}              from '../../widget.component'

export {Link}

// Typescript doesn't seem to know about the URL type
declare var URL : any;

@Component({
    templateUrl: 'templates/link.html',
    selector: "esqulino-link"
})
export class LinkComponent extends WidgetComponent<Link> {
    
    constructor(sidebarService : SidebarService,
                registrationService : RegistrationService,
                @Inject(WIDGET_MODEL_TOKEN) model : Link) {
        super(sidebarService, model);
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
