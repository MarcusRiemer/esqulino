import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SharedAppModule } from "../../shared/shared.module";

import { CourseNavComponent } from "./navigation/course-nav.component";
import { AssignmentOverviewComponent } from "./assignment/overview-assignment.component";
import { OverviewCourseConponent } from "./overview-course.component";
import { AssignmentComponent } from "./assignment/assignment.component";

@NgModule({
  imports: [CommonModule, SharedAppModule],
  declarations: [
    CourseNavComponent,
    AssignmentOverviewComponent,
    OverviewCourseConponent,
    AssignmentComponent,
  ],
  exports: [CourseNavComponent],
})
export class CourseModule {
  public static forRoot(): ModuleWithProviders<CourseModule> {
    return {
      ngModule: CourseModule,
      providers: [],
    };
  }
}
