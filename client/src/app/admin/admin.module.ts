import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { MatLegacyAutocompleteModule as MatAutocompleteModule } from "@angular/material/legacy-autocomplete";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyChipsModule as MatChipsModule } from "@angular/material/legacy-chips";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatLegacyProgressBarModule as MatProgressBarModule } from "@angular/material/legacy-progress-bar";

import { ReactiveFormsModule } from "@angular/forms";

import { SharedAppModule } from "../shared/shared.module";
import { EditorModule } from "../editor/editor.module";
import { CodeEditorModule } from "../editor/code/code.module";

import { adminRouting } from "./admin.routes";

import { AdminComponent } from "./admin.component";
import { AdminOverviewComponent } from "./admin-overview.component";
import { LinkGrammarComponent } from "./link-grammar.component";
import { JsonEditor } from "./json-editor.component";

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

import { OverviewProjectComponent } from "./project/overview-project.component";

import { CodeResourceGalleryComponent } from "./code-resource-gallery.component";

import { AdminNewsListComponent } from "./news/news.component";
import { AdminNewsEditComponent } from "./edit-news.component";
import { OverviewUserComponent } from "./user/overview-user.component";

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
    GalleryGrammarComponent,
    MetaCodeResourceSelectComponent,
    ProgrammingLanguageSelectComponent,
    OverviewUserComponent,
  ],
  exports: [],
})
export class AdminModule {}
