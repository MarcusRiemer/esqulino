import { Component, Input, OnInit } from "@angular/core";

@Component({
  templateUrl: "course-icon.component.html",
  selector: "course-icon",
})
export class CourseIconComponent implements OnInit {
  @Input() iconType:
    | "list-delete"
    | "list-edit"
    | "list-edit-singel"
    | "list-done"
    | "list-pending"
    | "compilation-problem"
    | "assignment-state-open"
    | "assignment-state-pending"
    | "assignment-state-done"
    | "to-evalute"
    | "participant";

  ngOnInit(): void {}
}
