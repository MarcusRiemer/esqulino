import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'
import {FormsModule}                    from '@angular/forms'

import {QueryEditorModule}              from './query/editor.module'
import {PageEditorModule}               from './page/page-editor.module'
import {SharedEditorModule}             from './shared/shared.module'

import {EditorComponent}                from './editor.component'
import {editorRouting}                  from './editor.routes'

import {PageService}                    from './page.service'
import {ProjectService, Project}        from './project.service'
import {ToolbarService}                 from './toolbar.service'
import {ToolbarComponent}               from './toolbar.component'
import {NavbarComponent}                from './navbar.component'
import {SidebarLoaderComponent}         from './sidebar-loader.component'
import {SidebarService}                 from './sidebar.service'
import {PreferencesService}             from './preferences.service'
import {QueryService}                   from './query.service'
import {SettingsComponent}              from './settings.component'
import {SchemaComponent}                from './schema.component'

import * as Query                       from './query/drag.service'
import * as Page                        from './page/drag.service'

@NgModule({
    imports : [
        CommonModule,
        FormsModule,
        editorRouting,
        SharedEditorModule,
        QueryEditorModule,
        PageEditorModule
    ],
    declarations: [
        EditorComponent,
        ToolbarComponent,
        NavbarComponent,
        SidebarLoaderComponent,
        SettingsComponent,
        SchemaComponent,
    ],
    providers: [
        SidebarService,
        PageService,
        PreferencesService,
        ProjectService,
        QueryService,
        ToolbarService,
        Query.DragService,
        Page.DragService,
    ],
    exports: [
    ]
  
})
export class EditorModule { }
