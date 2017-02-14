import {NgModule}                       from '@angular/core'
import {CommonModule}                   from '@angular/common'
import {FormsModule}                    from '@angular/forms'

import {SharedAppModule}                from '../shared/shared.module'

import {SharedEditorModule}             from './shared/shared.module'
import {PageEditorModule}               from './page/page-editor.module'
import {QueryEditorModule}              from './query/editor.module'

import {EditorComponent}                from './editor.component'
import {editorRouting}                  from './editor.routes'

import {ProjectExistsGuard}             from './project-exists.guard'

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
import {SchemaRedirectComponent}        from './schema/schema-redirect.component'
import {SchemaComponent}                from './schema/schema.component'
import {SchemaTableComponent}           from './schema/schema-table.component'
import {SchemaTableCompositionComponent}from './schema/schema-table-composition.component'
import {SchemaTableEditorComponent}     from './schema/schema-table-editor.component'
import {SchemaTableDetailsComponent}    from './schema/schema-table-details.component'
import {SchemaEditorModule}             from './schema/schema.module'


@NgModule({
    imports : [
        CommonModule,
        FormsModule,

        SharedAppModule,
        
        SharedEditorModule.forRoot(),
        PageEditorModule.forRoot(),
        QueryEditorModule.forRoot(),
        SchemaEditorModule.forRoot(),
    ],
    declarations: [
        EditorComponent,
        ToolbarComponent,
        NavbarComponent,
        SidebarLoaderComponent,
        SettingsComponent,
        SchemaRedirectComponent,
        SchemaComponent,
        SchemaTableComponent,
        SchemaTableCompositionComponent,
        SchemaTableEditorComponent,
        SchemaTableDetailsComponent,
    ],
    providers: [
        SidebarService,
        RegistrationService,
        PageService,
        PreferencesService,
        ProjectService,
        ProjectExistsGuard,
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
        SchemaRedirectComponent,
        SchemaEditorModule,
    ]
  
})
export class EditorModule { }
