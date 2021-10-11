import { Component, Input } from "@angular/core";

export interface AssignmentStatusInput {
  startDate: string;
  endDate: string;
  isGraded: boolean;
}

@Component({
  selector: "assignment-status",
  templateUrl: "./course-assignment-status.component.html",
})
export class CourseAssignmentStatusComponent {
  @Input() assignment: AssignmentStatusInput;

  dateExceeded(inputDate: string) {
    const today: Date = new Date();
    const date: Date = inputDate ? new Date(inputDate) : null;

    return today >= date;
  }
}
