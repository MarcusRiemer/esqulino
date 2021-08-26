import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule, DatePipe } from "@angular/common";

import { SharedAppModule } from "../../shared/shared.module";
import { CodeEditorModule } from "../code/code.module";
import { CourseNavComponent } from "./teacher/navigation/course-nav.component";
import { AssignmentOverviewComponent } from "./teacher/assignment/overview-assignment.component";
import { AssignmentComponent } from "./teacher/assignment/assignment.component";
import { OverviewCourseConponent } from "./overview-course.component";
import { CreateAssignmentComponent } from "./teacher/assignment/dialog/create-assignment.component";
import { CreateRequiredCodeResourceComponent } from "./teacher/assignment/dialog/create-required-code-resource.component";
import { CreateRequiredCodeResourceSolutionComponent } from "./teacher/assignment/dialog/create-required-code-resource-solution.component";
import { ChangeRequiredCodeResourceDialogComponent } from "./teacher/assignment/dialog/change-required-code-resource-dialog.component";
import { CourseIconComponent } from "./icons/course-icon.component";
import { UpdateAssignmentDialogComponent } from "./teacher/assignment/dialog/update-assignment-dialog.component";
import { OverviewParticipantComponent } from "./teacher/participants/overview-participant.component";
import { CreateParticipantGroup } from "./teacher/participants/create-participant-group.component";
import { CourseService } from "./course.service";
import { CourseParticipantNavComponent } from "./participant/navigation/course-participant-nav.component";
import { MultiLingualInputComponent } from "../../shared/multilingual-input.component";
import { OverviewSingelCourseParticipantComponent } from "./participant/overview-single-course-participant.component";
import { SingleAssignmentCardComponent } from "./participant/templates/single-assignment-card.component";
import { AssignmentParticipantComponent } from "./participant/assignment/assignment-participant.component";
import { CreateAssignmentSubmittedCodeResourceDialogComponent } from "./participant/assignment/dialog/create-assignment-submitteed-code-resource-dialog.component";
import { BlockEditorComponent } from "../code/block/block-editor.component";
import { SubmittedCodeResourceEditorParticipantComponente } from "./participant/assignment/submitted-code-resource-editor-participant";
import { RemainingDaysPipe } from "./participant/assignment/remaining-days.pipe";
import { OverviewParticipantsPrticipantComponent } from "./participant/participants/overview-participants-participant.component";

@NgModule({
  imports: [CommonModule, SharedAppModule, CodeEditorModule],
  declarations: [
    CourseNavComponent,
    AssignmentOverviewComponent,
    OverviewCourseConponent,
    AssignmentComponent,
    CreateAssignmentComponent,
    CreateRequiredCodeResourceComponent,
    CreateRequiredCodeResourceSolutionComponent,
    ChangeRequiredCodeResourceDialogComponent,
    CourseIconComponent,
    UpdateAssignmentDialogComponent,
    OverviewParticipantComponent,
    CreateParticipantGroup,
    CourseParticipantNavComponent,
    OverviewSingelCourseParticipantComponent,
    SingleAssignmentCardComponent,
    AssignmentParticipantComponent,
    CreateAssignmentSubmittedCodeResourceDialogComponent,
    SubmittedCodeResourceEditorParticipantComponente,
    RemainingDaysPipe,
    OverviewParticipantsPrticipantComponent,
  ],
  exports: [CourseNavComponent, CourseParticipantNavComponent],
})
export class CourseModule {
  public static forRoot(): ModuleWithProviders<CourseModule> {
    return {
      ngModule: CourseModule,
      providers: [CourseService],
    };
  }
}
