import {
    Component, Input, Output, EventEmitter,
    OnChanges, SimpleChanges, OnInit
} from "@angular/core"

import {
    Page, NavigateAction
} from '../../../../../shared/page/index'


@Component({
    selector : `nav-reference`,
    templateUrl: 'templates/navigate-action.html',
})
export class NavigateActionComponent {
    @Input() navigateAction : NavigateAction;

    @Output() parameterMappingChange = new EventEmitter();

    @Input() page : Page;

    /**
     * @return True, if this link has a target that could be shown.
     */
    get hasTarget() {
        return (this.navigateAction.isExternal ||
                (this.navigateAction.isInternal && this.navigateAction.isInternalPageResolveable));
    }

    /**
     * @return A user friendly name of the target.
     */
    get targetName() {
        return (this.navigateAction.friendlyTargetName);
    }

    /**
     * Internal and external target receive different icons.
     */
    get targetIcon() {
        if (this.navigateAction.isInternal && this.navigateAction.isInternalPageResolveable) {
            return ("fa-file-text-o");
        } else {
            return ("fa-external-link");
        }
    }

    /**
     * The user should be able to navigate to either the external URL
     * or the editor for the internal page.
     */
    get targetHref() {
        if (this.navigateAction.isExternal) {
            return (this.navigateAction.externalUrl);
        } else {
            return undefined
        }
    }


}
