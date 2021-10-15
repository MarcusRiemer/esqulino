import { Component, Input } from "@angular/core";

@Component({
  templateUrl: "course-icon.component.html",
  selector: "course-icon",
})
export class CourseIconComponent {
  @Input() iconType:
    | "list-delete"
    | "list-edit"
    | "list-edit-singel"
    | "list-done"
    | "list-pending"
    | "compilation-problem"
    | "assignment-state-planned"
    | "assignment-state-open"
    | "assignment-state-pending"
    | "assignment-state-done"
    | "assignment-type-given_full"
    | "assignment-type-given_partially"
    | "assignment-type-required"
    | "grade-overview"
    | "grade"
    | "participant"
    | "assignment"
    | "assignment-teacher-overview"
    | "assignment-teacher-solution"
    | "database"
    | "course-overview"
    | "date-reached"
    | "date-unreached"
    | "info-description";
}
