import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import {
  MatToolbarModule, MatButtonModule, MatMenuModule
} from '@angular/material'

import { AceEditorModule } from 'ng2-ace-editor';

import { SharedAppModule } from '../shared/shared.module'

import { adminRouting } from './admin.routes'

import { AdminComponent } from './admin.component'
import { AdminOverviewComponent } from './admin-overview.component'
import { EditGrammarComponent } from './edit-grammar.component'
import { LinkGrammarComponent } from './link-grammar.component'
import { JsonEditor } from './json-editor.component'
import { ToolbarComponent } from './toolbar.component'
import { ToolbarService } from './toolbar.service'

import { CreateBlockLanguageComponent } from './block-language/create-block-language.component'
import { EditBlockLanguageComponent } from './block-language/edit-block-language.component'
import { EditActualParameters } from './block-language/edit-actual-parameters.component'
import { EditInputParameterValueComponent } from './block-language/edit-input-parameter-value.component'
import { ErrorListComponent } from './block-language/error-list.component'

const materialImports = [
  MatToolbarModule, MatButtonModule, MatMenuModule
]

@NgModule({
  imports: [
    ...materialImports,
    AceEditorModule,
    CommonModule,
    SharedAppModule,
    adminRouting,
  ],
  providers: [
    ToolbarService
  ],
  declarations: [
    AdminComponent,
    AdminOverviewComponent,
    CreateBlockLanguageComponent,
    EditBlockLanguageComponent,
    EditActualParameters,
    EditInputParameterValueComponent,
    EditGrammarComponent,
    ErrorListComponent,
    LinkGrammarComponent,
    JsonEditor,
    ToolbarComponent,
  ],
  exports: [
  ]
})
export class AdminModule { }
