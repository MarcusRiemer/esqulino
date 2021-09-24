import { NgModule } from "@angular/core";

import { SharedAppModule } from "../shared/shared.module";

import { userRouting } from "./user.routes";
import { UserComponent } from "./user.component";
import { OwnProjectsOverviewComponent } from "./own-projects-overview.component";
import { CreateProjectComponent } from "./create-project.component";
import { ListCorusesOverviewComponent } from "./list-courses-overview.component";
import { ListCoursesOverviewCard } from "./template/list-courses-overview-card";
import { MyListCoursesOverviewComponent } from "./my-list-courses-overview.component";
import { OwnListCoursesOverviewCard } from "./template/own-list-courses-overview-card";
import { ListJoinCourseGroup } from "./template/list-join-course-groups";
import { ParticipatedListCoursesOverviewCard } from "./template/participated-list-courses-overview-card";

@NgModule({
  imports: [SharedAppModule, userRouting],
  declarations: [
    UserComponent,
    OwnProjectsOverviewComponent,
    CreateProjectComponent,
    ListCorusesOverviewComponent,
    ListCoursesOverviewCard,
    MyListCoursesOverviewComponent,
    OwnListCoursesOverviewCard,
    ListJoinCourseGroup,
    ParticipatedListCoursesOverviewCard,
  ],
  exports: [UserComponent],
})
export class UserModule {}
