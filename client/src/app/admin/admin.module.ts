import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatChipsModule } from "@angular/material/chips";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatProgressBarModule } from "@angular/material/progress-bar";

import { ReactiveFormsModule } from "@angular/forms";

import { AceEditorModule } from "ng2-ace-editor";

import { SharedAppModule } from "../shared/shared.module";
import { EditorModule } from "../editor/editor.module";
import { CodeEditorModule } from "../editor/code/code.module";

import { adminRouting } from "./admin.routes";

import { AdminComponent } from "./admin.component";
import { AdminOverviewComponent } from "./admin-overview.component";
import { LinkGrammarComponent } from "./link-grammar.component";
import { JsonEditor } from "./json-editor.component";
import { JsonSchemaValidationService } from "./json-schema-validation.service";

import { CreateBlockLanguageComponent } from "./block-language/create-block-language.component";
import { EditBlockLanguageComponent } from "./block-language/edit-block-language.component";
import { EditActualParametersComponent } from "./block-language/edit-actual-parameters.component";
import { EditInputParameterValueComponent } from "./block-language/edit-input-parameter-value.component";
import { EditTraitScopesComponent } from "./block-language/edit-trait-scopes.component";
import { EditSingleTraitScopeComponent } from "./block-language/edit-single-trait-scope.component";
import { ErrorListComponent } from "./block-language/error-list.component";
import { OverviewBlockLanguageComponent } from "./block-language/overview-block-language.component";

import { CreateGrammarComponent } from "./grammar/create-grammar.component";
import { EditGrammarComponent } from "./grammar/edit-grammar.component";
import { OverviewGrammarComponent } from "./grammar/overview-grammar.component";
import { GalleryGrammarComponent } from "./grammar/gallery-grammar.component";
import { MetaCodeResourceSelectComponent } from "./grammar/meta-code-resource-select.component";

import { ProgrammingLanguageSelectComponent } from "./shared/programming-language-select.component";
import { GrammarSelectComponent } from "./shared/grammar-select.component";

import { OverviewProjectComponent } from "./project/overview-project.component";

import { CodeResourceGalleryComponent } from "./code-resource-gallery.component";

import { AdminNewsListComponent } from "./news/news.component";
import { AdminNewsEditComponent } from "./edit-news.component";
import { ChangeRoles } from "./change-roles.component";

const materialModules = [
  MatAutocompleteModule,
  MatChipsModule,
  MatFormFieldModule,
  ReactiveFormsModule,
  MatCheckboxModule,
  MatTableModule,
  MatPaginatorModule,
  MatSortModule,
  MatProgressBarModule,
];

@NgModule({
  imports: [
    AceEditorModule,
    CommonModule,
    SharedAppModule,
    EditorModule,
    CodeEditorModule,

    adminRouting,
    ...materialModules,
  ],
  declarations: [
    AdminComponent,
    AdminOverviewComponent,
    CreateBlockLanguageComponent,
    CreateGrammarComponent,
    CodeResourceGalleryComponent,
    EditBlockLanguageComponent,
    EditActualParametersComponent,
    EditInputParameterValueComponent,
    EditGrammarComponent,
    EditTraitScopesComponent,
    ErrorListComponent,
    EditSingleTraitScopeComponent,
    LinkGrammarComponent,
    JsonEditor,
    OverviewGrammarComponent,
    OverviewBlockLanguageComponent,
    OverviewProjectComponent,
    AdminNewsListComponent,
    AdminNewsEditComponent,
    ChangeRoles,
    GalleryGrammarComponent,
    MetaCodeResourceSelectComponent,
    ProgrammingLanguageSelectComponent,
    GrammarSelectComponent,
  ],
  providers: [JsonSchemaValidationService],
  exports: [],
})
export class AdminModule {}
