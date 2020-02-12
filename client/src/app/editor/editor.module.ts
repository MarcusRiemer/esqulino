import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'

import { SharedAppModule } from '../shared/shared.module'

import { SharedEditorModule } from './shared/shared.module'
import { SchemaEditorModule } from './schema/schema.module'
import { ImageEditorModule } from './image/image.module'
import { CodeEditorModule } from './code/code.module'

import { EditorComponent } from './editor.component'

import { DraggedBlockComponent } from './dragged-block.component'
import { ToolbarComponent } from './toolbar.component'
import { NavbarComponent } from './navbar.component'
import { SidebarLoaderComponent } from './sidebar-loader.component'

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
  exports: [
    SharedEditorModule,
    EditorComponent,
    SettingsComponent,
    SchemaEditorModule,
    BlockHostComponent,
  ]

})
export class EditorModule { }
