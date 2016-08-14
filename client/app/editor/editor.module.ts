import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'
import {FormsModule}                    from '@angular/forms'

import SharedEditorModule               from './shared/shared.module'
import PageEditorModule                 from './page/page-editor.module'
import QueryEditorModule                from './query/editor.module'

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
import {RegistrationService}            from './registration.service'
import {SettingsComponent}              from './settings.component'
import {SchemaComponent}                from './schema.component'
import {SchemaTableComponent}           from './schema-table.component'

@NgModule({
    imports : [
        CommonModule,
        FormsModule,
        //editorRouting,
        SharedEditorModule,
        PageEditorModule.forRoot(),
        QueryEditorModule.forRoot(),
    ],
    declarations: [
        EditorComponent,
        ToolbarComponent,
        NavbarComponent,
        SidebarLoaderComponent,
        SettingsComponent,
        SchemaComponent,
        SchemaTableComponent
    ],
    providers: [
        SidebarService,
        RegistrationService,
        PageService,
        PreferencesService,
        ProjectService,
        QueryService,
        ToolbarService,
    ],
    exports: [
        SharedEditorModule,
        QueryEditorModule,
        PageEditorModule,
        EditorComponent,
        SettingsComponent,
        SchemaComponent,
    ]
  
})
export default class EditorModule { }
