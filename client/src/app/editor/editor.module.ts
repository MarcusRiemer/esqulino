import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { SharedAppModule } from '../shared/shared.module'

import { SchemaEditorModule } from './schema/schema.module'
import { ImageEditorModule } from './image/image.module'
import { CodeEditorModule } from './code/code.module'

import { EditorComponent } from './editor.component'

import { DraggedBlockComponent } from './dragged-block.component'
import { ToolbarComponent } from './toolbar.component'
import { NavbarComponent } from './navbar.component'
import { SidebarLoaderComponent } from './sidebar-loader.component'
import { SettingsComponent } from './project-settings/settings.component'
import { DatabaseEmptyComponent } from './database-empty.component'
import { QueryIconComponent } from './query-icon.component'
import { SidebarItemHost } from './sidebar-item-host.component'
import { TrashComponent } from './trash.component'
import { TrashService } from './trash.service'
import { ContenteditableModel } from './contenteditable-model.directive'
import { SourceIconComponent } from './source-icon.component'


@NgModule({
  imports: [
    CommonModule,
    FormsModule,

    SharedAppModule,

    ImageEditorModule.forRoot(),
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
    QueryIconComponent,
    SidebarItemHost,
    ContenteditableModel,
    TrashComponent,
    DatabaseEmptyComponent,
    SourceIconComponent,
  ],
  entryComponents: [
    DraggedBlockComponent,
  ],
  providers: [
    TrashService
  ],
  exports: [
    EditorComponent,
    SettingsComponent,
    SchemaEditorModule,

    QueryIconComponent,
    SidebarItemHost,
    TrashComponent,
    ContenteditableModel,
    DatabaseEmptyComponent,
    SourceIconComponent,
  ]

})
export class EditorModule { }
