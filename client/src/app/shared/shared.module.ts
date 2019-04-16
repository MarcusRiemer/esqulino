import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { PortalModule } from '@angular/cdk/portal';
import {
  MatToolbarModule, MatButtonModule, MatMenuModule,
  MatTooltipModule, MatSnackBarModule, MatTabsModule,
  MatSidenavModule, MatListModule, MatCardModule
} from '@angular/material'

import { AnalyticsService } from './analytics.service';
import { BrowserService } from './browser.service'
import { DefaultValuePipe } from './default-value.pipe'
import { FlashMessageListComponent } from './flash.component';
import { FlashService } from './flash.service';
import { ProjectDescriptionService } from './project.description.service';
import { LanguageService } from './language.service';
import { ServerApiService } from './serverdata/serverapi.service';
import { ServerDataService } from './serverdata/server-data.service'
import { VideoService } from './video.service';
import { ToolbarComponent } from './toolbar.component'
import { ToolbarService } from './toolbar.service'
import { ChangeLanguageComponent } from './change-language.component';
import { JavascriptRequiredComponent } from './javascript-required.component';
import { SideNavComponent } from './side-nav.component';
import { NavSiteComponent } from './nav-page.component';
import { NewsComponent } from './news.component';
import { NewsDetailsComponent } from './news-details.component';

const materialModules = [
  MatToolbarModule, MatButtonModule, MatMenuModule,
  MatTooltipModule, MatSnackBarModule, MatTabsModule,
  MatSidenavModule, MatListModule, MatCardModule
]

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
    HttpModule,
    HttpClientModule,
    PortalModule,
    ...materialModules
  ],
  declarations: [
    DefaultValuePipe,
    FlashMessageListComponent,
    ToolbarComponent,
    ChangeLanguageComponent,
    JavascriptRequiredComponent,
    SideNavComponent,
    NavSiteComponent,
    NewsComponent,
    NewsDetailsComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpModule,
    PortalModule,
    ...materialModules,
    ToolbarComponent,
    FlashMessageListComponent,
    DefaultValuePipe,
    ChangeLanguageComponent,
    JavascriptRequiredComponent,
    SideNavComponent,
    NavSiteComponent,
    NewsComponent,
    NewsDetailsComponent
  ]
})
export class SharedAppModule {
  static forRoot(): ModuleWithProviders {
    return ({
      ngModule: SharedAppModule,
      providers: [
        AnalyticsService,
        BrowserService,
        FlashService,
        ServerApiService,
        ServerDataService,
        ProjectDescriptionService,
        VideoService,
        LanguageService,
        ToolbarService,
      ]
    });
  }

}
