import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SharedAppModule } from "../shared/shared.module";

import { FrontComponent } from "./front.component";
import { frontRouting } from "./front.routes";

import { AboutComponent } from "./about.component";
import { AboutAcademiaComponent } from "./academia.component";
import { CreateProjectComponent } from "./create-project.component";
import { AboutPupilComponent } from "./pupil.component";
import { AboutTeacherComponent } from "./teacher.component";
import { ImprintComponent } from "./imprint.component";
import { ProjectListComponent } from "./project-list.component";
import { ProjectListItemComponent } from "./project-list-item.component";
import { PrivacyComponent } from "./privacy.component";
import { VideoDisplayComponent } from "./video-display.component";
import { VersionComponent } from "./version.component";
import { DevelopmentComponent } from "./development.component";
import { CreateLanguageComponent } from "./create-language.component";

@NgModule({
  imports: [CommonModule, SharedAppModule, frontRouting],
  declarations: [
    AboutComponent,
    AboutAcademiaComponent,
    AboutPupilComponent,
    AboutTeacherComponent,
    CreateProjectComponent,
    FrontComponent,
    ImprintComponent,
    ProjectListComponent,
    ProjectListItemComponent,
    VideoDisplayComponent,
    PrivacyComponent,
    VersionComponent,
    DevelopmentComponent,
    CreateLanguageComponent,
  ],
  exports: [],
  providers: [],
})
export class FrontModule {}
