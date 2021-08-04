import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { SharedAppModule } from "../../shared/shared.module";

import { CourseNavComponent } from "./navigation/course-nav.component";
import { AssignmentOverviewComponent } from "./assignment/overview-assignment.component";
import { OverviewCourseConponent } from "./overview-course.component";
import { AssignmentComponent } from "./assignment/assignment.component";
import { CourseService } from "./course.service";
import { CreateAssignmentComponent } from "./assignment/dialog/create-assignment.component";
import { FormsModule } from "@angular/forms";
import { SettingsComponent } from "../project-settings/settings.component";
import { CreateRequiredCodeResourceComponent } from "./assignment/dialog/create-required-code-resource.component";

import { CreateRequiredCodeResourceSolutionComponent } from "./assignment/dialog/create-required-code-resource-solution.component";
import { ChangeRequiredCodeResourceDialogComponent } from "./assignment/dialog/change-required-code-resource-dialog.component";
import { CodeEditorModule } from "../code/code.module";

@NgModule({
  imports: [CommonModule, SharedAppModule, CodeEditorModule.forRoot()],
  declarations: [
    CourseNavComponent,
    AssignmentOverviewComponent,
    OverviewCourseConponent,
    AssignmentComponent,
    CreateAssignmentComponent,
    CreateRequiredCodeResourceComponent,
    CreateRequiredCodeResourceSolutionComponent,
    ChangeRequiredCodeResourceDialogComponent,
  ],
  exports: [CourseNavComponent],
})
export class CourseModule {
  public static forRoot(): ModuleWithProviders<CourseModule> {
    return {
      ngModule: CourseModule,
      providers: [CourseService],
    };
  }
}
