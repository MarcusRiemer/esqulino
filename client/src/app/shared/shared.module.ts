import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { PortalModule } from "@angular/cdk/portal";

import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatListModule } from "@angular/material/list";
import { MatMenuModule } from "@angular/material/menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatTabsModule } from "@angular/material/tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialogModule } from "@angular/material/dialog";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { MatTableModule } from "@angular/material/table";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatProgressBarModule } from "@angular/material/progress-bar";

import { AnalyticsService } from "./analytics.service";
import { BrowserService } from "./browser.service";
import { DefaultValuePipe } from "./default-value.pipe";
import { FlashMessageListComponent } from "./flash.component";
import { FlashService } from "./flash.service";
import { LanguageService } from "./language.service";
import { ServerApiService } from "./serverdata/serverapi.service";
import { VideoService } from "./video.service";
import { ToolbarComponent } from "./toolbar.component";
import { ToolbarService } from "./toolbar.service";
import { ChangeLanguageComponent } from "./change-language.component";
import { JavascriptRequiredComponent } from "./javascript-required.component";
import { SideNavComponent } from "./side-nav.component";
import { NavSiteComponent } from "./nav-page.component";
import { NewsListComponent } from "./news-list.component";
import { NewsDetailsComponent } from "./news-details.component";
import { MultiLingualInputComponent } from "./multilingual-input.component";
import { MultiLingualEditorComponent } from "./multilingual-editor.component";
import { FocusDirective } from "./focus-element.directive";
import { UserButtonsComponent } from "./auth/user-buttons.component";
import { AuthDialogComponent } from "./auth/auth-dialog.component";
import { LoginWrapperComponent } from "./auth/login-wrapper.component";
import { LoggedInGuard } from "./guards/logged-in.guard";
import { ProviderShowComponent } from "./provider-show.component";
import { EmptyComponent } from "./empty.component";

import {
  ListGrammarDataService,
  IndividualGrammarDataService,
  ListBlockLanguageDataService,
  IndividualBlockLanguageDataService,
  ProjectDataService,
  IndividualProjectDataService,
  AdminListProjectDataService,
  MutateGrammarService,
  MutateBlockLanguageService,
} from "./serverdata";

import { RequestResetPasswordComponent } from "./auth/request-reset-password.component";
import { ProviderButtonComponent } from "./auth/provider-button.component";
import { SignInComponent } from "./auth/sign-in.component";
import { SignUpComponent } from "./auth/sign-up.component";
import { ValidateInputComponent } from "./validate-input.component";
import { ChangePasswordComponent } from "./auth/change-password.component";
import { SideNavService } from "./side-nav.service";
import { RequestVerifyEmailComponent } from "./auth/request-verify-email.component";
import { ProvidersAllButtonsComponent } from "./auth/providers-all-buttons.component";
import { IsUserGuard } from "./guards/is-user.guard";
import { IsAdminGuard } from "./guards/is-admin.guard";
import { MayPerformComponent } from "./may-perform.component";
import { PerformDataService } from "./authorisation/perform-data.service";
import { MessageDialogComponent } from "./message-dialog.component";
import { MasterGuard } from "./guards/master-guard";
import { UnexpectedLogoutInterceptor } from "./unexpected-logout.interceptor";
import { UserService } from "./auth/user.service";
import { ResourceReferencesService } from "./resource-references.service";
import { ResourceReferencesOnlineService } from "./resource-references-online.service";
import { PaginatorTableComponent } from "./table/paginator-table.component";
import { ConditionalDisplayDirective } from "./table/directives/conditional-display.directive";

const dataServices = [
  ListGrammarDataService,
  IndividualGrammarDataService,
  MutateGrammarService,
  ListBlockLanguageDataService,
  IndividualBlockLanguageDataService,
  MutateBlockLanguageService,
  ProjectDataService,
  IndividualProjectDataService,
  AdminListProjectDataService,
];

const materialModules = [
  MatToolbarModule,
  MatButtonModule,
  MatMenuModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatTabsModule,
  MatSidenavModule,
  MatListModule,
  MatCardModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatInputModule,
  MatFormFieldModule,
  MatCheckboxModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatSortModule,
  MatPaginatorModule,
  MatTableModule,
  MatProgressBarModule,
];

/**
 * Bundles facilities that are used all over the app, no matter
 * what the exact domain is. This basically boils down to:
 *
 * - User specific data and authentication
 * - Logging and error handling
 * - Helper utilities
 * - General Components (own and third party)
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpClientModule,
    PortalModule,
    ReactiveFormsModule,
    ...materialModules,
  ],
  declarations: [
    EmptyComponent,
    DefaultValuePipe,
    FlashMessageListComponent,
    ToolbarComponent,
    ChangeLanguageComponent,
    JavascriptRequiredComponent,
    SideNavComponent,
    NavSiteComponent,
    NewsListComponent,
    NewsDetailsComponent,
    MultiLingualInputComponent,
    MultiLingualEditorComponent,
    AuthDialogComponent,
    UserButtonsComponent,
    LoginWrapperComponent,
    ProviderButtonComponent,
    SignInComponent,
    SignUpComponent,
    ValidateInputComponent,
    FocusDirective,
    RequestResetPasswordComponent,
    RequestVerifyEmailComponent,
    ChangePasswordComponent,
    ValidateInputComponent,
    ProviderShowComponent,
    MayPerformComponent,
    ProvidersAllButtonsComponent,
    MessageDialogComponent,
    PaginatorTableComponent,
    ConditionalDisplayDirective,
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    PortalModule,
    HttpClientModule,

    ...materialModules,
    ToolbarComponent,
    FlashMessageListComponent,
    DefaultValuePipe,
    ChangeLanguageComponent,
    JavascriptRequiredComponent,
    SideNavComponent,
    NavSiteComponent,
    NewsListComponent,
    NewsDetailsComponent,
    MultiLingualInputComponent,
    MultiLingualEditorComponent,
    AuthDialogComponent,
    UserButtonsComponent,
    LoginWrapperComponent,
    ProviderButtonComponent,
    SignInComponent,
    SignUpComponent,
    ValidateInputComponent,
    FocusDirective,
    RequestResetPasswordComponent,
    RequestVerifyEmailComponent,
    ChangePasswordComponent,
    MayPerformComponent,
    ProviderShowComponent,
    MessageDialogComponent,
    ProvidersAllButtonsComponent,
    PaginatorTableComponent,
  ],
  entryComponents: [
    AuthDialogComponent,
    ChangePasswordComponent,
    MessageDialogComponent,
  ],
})
export class SharedAppModule {
  static forRoot(): ModuleWithProviders<SharedAppModule> {
    return {
      ngModule: SharedAppModule,
      providers: [
        UserService,
        AnalyticsService,
        BrowserService,
        FlashService,
        ServerApiService,
        VideoService,
        LanguageService,
        ToolbarService,
        SideNavService,
        ...dataServices,
        LoggedInGuard,
        MasterGuard,
        IsUserGuard,
        PerformDataService,
        IsAdminGuard,
        {
          provide: ResourceReferencesService,
          useClass: ResourceReferencesOnlineService,
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: UnexpectedLogoutInterceptor,
          multi: true,
        },
      ],
    };
  }
}
