import {Component, Injector, Input}     from '@angular/core'
import {Router, RouteParams}            from '@angular/router-deprecated'

import {Observable}                     from 'rxjs/Observable'

import {Project}                        from '../project'
import {ProjectService}                 from '../project.service'
import {ToolbarService}                 from '../toolbar.service'


/**
 * Top level component to edit esqulino pages
 */
@Component({
    templateUrl: 'app/editor/page/templates/editor.html',
    directives: [],
    providers: [],
    pipes: []
})
export class PageEditorComponent {
    /**
     * The currently edited project
     */
    public project : Project;
}

