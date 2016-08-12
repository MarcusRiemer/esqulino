import {Component, Inject, OnInit}    from '@angular/core'

import {Link}                         from '../../../../shared/page/widgets/index'

import {SidebarService}               from '../../../sidebar.service'
import {WIDGET_MODEL_TOKEN}           from '../../../editor.token'

import {WidgetComponent}              from '../../widget.component'
import {
    LINK_SIDEBAR_IDENTIFIER, LinkSidebarComponent
} from '../../sidebar/link.sidebar.component'

export {Link}

// Typescript doesn't seem to know about the URL type
declare var URL : any;

@Component({
    templateUrl: 'app/editor/page/wysiwyg/widgets/templates/link.html',
    selector: "esqulino-link"
})
export class LinkComponent extends WidgetComponent<Link> {
    
    constructor(@Inject(SidebarService) sidebarService : SidebarService,
                @Inject(WIDGET_MODEL_TOKEN) model : Link) {
        super(sidebarService, model, {
            id : LINK_SIDEBAR_IDENTIFIER,
            type : LinkSidebarComponent
        });
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
        const action = this.model.action;

        if (action.isInternal && action.isInternalPageResolveable) {
            return (action.internalTargetPage.name);
        } else if (action.isExternal) {
            try {
                const url = new URL(action.externalUrl);
                return (url.host);
            } catch (e) {
                return (action.externalUrl);
            }
        } else {
            return "ERROR: No target";
        }
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
