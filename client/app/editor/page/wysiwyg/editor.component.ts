import {Component}                      from '@angular/core'
import {ActivatedRoute}                 from '@angular/router'

import {ProjectService, Project}        from '../../project.service'
import {PageService, Page}              from '../../page.service'
import {PreferencesService}             from '../../preferences.service'
import {SidebarService}                 from '../../sidebar.service'
import {RegistrationService}            from '../../registration.service'
import {ToolbarService}                 from '../../toolbar.service'

import {PageEditor}                     from '../page-editor'
import {ServerPreviewComponent}         from '../server-preview.component'
import {SidebarDataComponent}           from '../sidebar-data.component'
import {SidebarWidgetsComponent}        from '../sidebar-widgets.component'
import {PageDataComponent}              from '../page-data.component'

import {PageLayoutComponent}            from './page-layout.component'

/**
 * A WYSIWYG-editor for pages.
 */
@Component({
    templateUrl: 'app/editor/page/wysiwyg/templates/editor.html',
    directives: [PageLayoutComponent, PageDataComponent, ServerPreviewComponent]
})
export class PageVisualEditorComponent extends PageEditor {
    constructor(
        projectService : ProjectService,
        pageService : PageService,
        toolbarService: ToolbarService,
        routeParams: ActivatedRoute,
        sidebarService : SidebarService,
        preferences : PreferencesService,
        registrationService : RegistrationService
    ) {
        super(projectService, pageService, toolbarService,
              routeParams, sidebarService, preferences,
              registrationService);
    }
}

