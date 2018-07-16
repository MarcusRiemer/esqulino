import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';

import { PortalModule } from '@angular/cdk/portal';

import { AnalyticsService } from './analytics.service';
import { DefaultValuePipe } from './default-value.pipe'
import { FlashMessageListComponent } from './flash.component';
import { FlashService } from './flash.service';
import { ProjectDescriptionService } from './project.description.service';
import { LanguageService } from './language.service';
import { ServerApiService } from './serverapi.service';
import { ServerDataService } from './server-data.service'
import { VideoService } from './video.service';

/**
 * Bundles facilities that are used all over esqulino, no matter
 * what the exact domain is. This basically boils down to:
 * 
 * - User specific data and authentication
 * - Logging and error handling 
 * - Helper utilities
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpModule,
    HttpClientModule,
    PortalModule,
  ],
  declarations: [
    DefaultValuePipe,
    FlashMessageListComponent,
  ],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    HttpModule,
    PortalModule,

    DefaultValuePipe,
    FlashMessageListComponent,
  ]
})
export class SharedAppModule {
  static forRoot(): ModuleWithProviders {
    return ({
      ngModule: SharedAppModule,
      providers: [
        AnalyticsService,
        FlashService,
        ServerApiService,
        ServerDataService,
        ProjectDescriptionService,
        VideoService,
        LanguageService,
      ]
    });
  }

}
