import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { SharedAppModule } from '../shared/shared.module'

import { SharedEditorModule } from './shared/shared.module'
import { SchemaEditorModule } from './schema/schema.module'
import { ImageEditorModule } from './image/image.module'
import { CodeEditorModule } from './code/code.module'

import { CurrentCodeResourceService } from './current-coderesource.service'

import { EditorComponent } from './editor.component'

import { ProjectExistsGuard } from './project-exists.guard'

import { CodeResourceService } from './coderesource.service'
import { DragService } from './drag.service'
import { DraggedBlockComponent } from './dragged-block.component'
import { ProjectService } from './project.service'
import { ToolbarService } from './toolbar.service'
import { ToolbarComponent } from './toolbar.component'
import { NavbarComponent } from './navbar.component'
import { SidebarLoaderComponent } from './sidebar-loader.component'
import { SidebarService } from './sidebar.service'
import { PreferencesService } from './preferences.service'
import { RegistrationService } from './registration.service'

import { SettingsComponent } from './project-settings/settings.component'
import { BlockHostComponent } from './code/block/block-host.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    SharedAppModule,

    ImageEditorModule.forRoot(),
    SharedEditorModule.forRoot(),
    SchemaEditorModule.forRoot(),
    CodeEditorModule.forRoot(),
  ],
  declarations: [
    DraggedBlockComponent,
    EditorComponent,
    ToolbarComponent,
    NavbarComponent,
    SidebarLoaderComponent,
    SettingsComponent,
  ],
  entryComponents: [
    DraggedBlockComponent,
  ],
  providers: [
    CodeResourceService,
    DragService as any,
    SidebarService,
    RegistrationService,
    PreferencesService,
    ProjectService,
    ProjectExistsGuard,
    ToolbarService,
    CurrentCodeResourceService,
  ],
  exports: [
    SharedEditorModule,
    EditorComponent,
    SettingsComponent,
    SchemaEditorModule,
    BlockHostComponent,
  ]

})
export class EditorModule { }
