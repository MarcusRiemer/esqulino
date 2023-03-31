import { NgModule, ModuleWithProviders } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { OverlayModule } from "@angular/cdk/overlay";
import { PortalModule } from "@angular/cdk/portal";

import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatNativeDateModule } from "@angular/material/core";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatLegacySnackBarModule as MatSnackBarModule } from "@angular/material/legacy-snack-bar";
import { MatLegacyTabsModule as MatTabsModule } from "@angular/material/legacy-tabs";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatLegacyTooltipModule as MatTooltipModule } from "@angular/material/legacy-tooltip";
import { MatLegacyDialogModule as MatDialogModule } from "@angular/material/legacy-dialog";
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from "@angular/material/legacy-progress-spinner";
import { MatLegacyTableModule as MatTableModule } from "@angular/material/legacy-table";
import { MatLegacyPaginatorModule as MatPaginatorModule } from "@angular/material/legacy-paginator";
import { MatSortModule } from "@angular/material/sort";
import { MatLegacyProgressBarModule as MatProgressBarModule } from "@angular/material/legacy-progress-bar";
import { MatIconModule } from "@angular/material/icon";

import { AnalyticsService, PiwikAnalyticsService } from "./analytics.service";
import { BrowserService } from "./browser.service";
import { DefaultValuePipe } from "./default-value.pipe";
import { FlashMessageListComponent } from "./flash.component";
import { FlashService } from "./flash.service";
import { LanguageService } from "./language.service";
import { ServerApiService } from "./serverdata";
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
import { CurrentLanguagePipe } from "./current-language.pipe";
import { FocusDirective } from "./focus-element.directive";
import { UserButtonsComponent } from "./auth/user-buttons.component";
import { AuthDialogComponent } from "./auth/auth-dialog.component";
import { LoginWrapperComponent } from "./auth/login-wrapper.component";
import { LoggedInGuard } from "./guards/logged-in.guard";
import { ProviderShowComponent } from "./provider-show.component";
import { EmptyComponent } from "./empty.component";

import { ProviderButtonComponent } from "./auth/provider-button.component";
import { ValidateInputComponent } from "./validate-input.component";
import { SideNavService } from "./side-nav.service";
import { ProvidersAllButtonsComponent } from "./auth/providers-all-buttons.component";
import { IsUserGuard } from "./guards/is-user.guard";
import { IsAdminGuard } from "./guards/is-admin.guard";
import { MayPerformComponent } from "./authorisation/may-perform.component";
import { PerformDataService } from "./authorisation/perform-data.service";
import { MessageDialogComponent } from "./message-dialog.component";
import { UnexpectedLogoutInterceptor } from "./unexpected-logout.interceptor";
import { UserService } from "./auth/user.service";
import { ResourceReferencesService } from "./resource-references.service";
import { PaginatorTableGraphqlComponent } from "./table/paginator-table-graphql.component";

import { ConditionalDisplayDirective } from "./table/directives/conditional-display.directive";
import { MayPerformService } from "./authorisation/may-perform.service";
import { LifecycleLogDirective } from "./lifecycle-log.directive";
import { ChangeDetectionLogDirective } from "./change-detection-log.directive";
import { UrlFriendlyIdPipe } from "./url-friendly-id.pipe";
import { AffectedResourcesDialogComponent } from "./affected-resources-dialog.component";
import { DisplayResourcePipe } from "./display-resource.pipe";
import { ApolloModule } from "apollo-angular";

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
  MatIconModule,
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
    ApolloModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    PortalModule,
    ReactiveFormsModule,
    ...materialModules,
    OverlayModule,
  ],
  declarations: [
    EmptyComponent,
    DefaultValuePipe,
    CurrentLanguagePipe,
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
    ValidateInputComponent,
    FocusDirective,
    ValidateInputComponent,
    ProviderShowComponent,
    MayPerformComponent,
    ProvidersAllButtonsComponent,
    MessageDialogComponent,
    PaginatorTableGraphqlComponent,
    ConditionalDisplayDirective,
    LifecycleLogDirective,
    ChangeDetectionLogDirective,
    UrlFriendlyIdPipe,
    AffectedResourcesDialogComponent,
    DisplayResourcePipe,
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    PortalModule,
    HttpClientModule,

    ...materialModules,
    ToolbarComponent,
    FlashMessageListComponent,
    DefaultValuePipe,
    CurrentLanguagePipe,
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
    ValidateInputComponent,
    FocusDirective,
    MayPerformComponent,
    ProviderShowComponent,
    MessageDialogComponent,
    ProvidersAllButtonsComponent,
    PaginatorTableGraphqlComponent,
    ConditionalDisplayDirective,
    LifecycleLogDirective,
    ChangeDetectionLogDirective,
    UrlFriendlyIdPipe,
    AffectedResourcesDialogComponent,
    DisplayResourcePipe,
  ],
})
export class SharedAppModule {
  static forRoot(): ModuleWithProviders<SharedAppModule> {
    return {
      ngModule: SharedAppModule,
      providers: [
        UserService,
        {
          provide: AnalyticsService,
          useClass: PiwikAnalyticsService,
        },
        BrowserService,
        FlashService,
        ServerApiService,
        VideoService,
        LanguageService,
        ToolbarService,
        SideNavService,
        LoggedInGuard,
        IsUserGuard,
        PerformDataService,
        IsAdminGuard,
        MayPerformService,
        ResourceReferencesService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: UnexpectedLogoutInterceptor,
          multi: true,
        },
      ],
    };
  }
}
