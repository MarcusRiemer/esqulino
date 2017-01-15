import {Component}                      from '@angular/core'
import {ActivatedRoute}                 from '@angular/router'

import {ProjectService, Project}        from '../../project.service'
import {PageService, Page}              from '../../page.service'
import {PreferencesService}             from '../../preferences.service'
import {SidebarService}                 from '../../sidebar.service'
import {ToolbarService}                 from '../../toolbar.service'

import {PageEditor}                     from '../page-editor'

import {PageTreeComponent}              from './page-tree.component'

/**
 * A DOM-orientated editor for pages.
 */
@Component({
    templateUrl: 'templates/editor.html',
})
export class PageTreeEditorComponent extends PageEditor {
    constructor(
        projectService : ProjectService,
        pageService : PageService,
        toolbarService: ToolbarService,
        routeParams: ActivatedRoute,
        sidebarService : SidebarService,
        preferences : PreferencesService
    ) {
        super(projectService, pageService, toolbarService,
              routeParams, sidebarService, preferences);
    }    
}

