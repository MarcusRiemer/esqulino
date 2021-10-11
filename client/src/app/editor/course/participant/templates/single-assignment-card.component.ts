import { Component, Input, SimpleChanges } from "@angular/core";
import { from } from "rxjs";
import { AssignmentStatusInput } from "../../icons/course-assignment-status.component";
interface singleAssignment {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  grade?: number;
  requiredCodeResource: {
    id: string;
    submittion: boolean;
  };
}

@Component({
  selector: "singel-assignment-card",
  templateUrl: "./single-assignment-card.component.html",
})
export class SingleAssignmentCardComponent {
  @Input() singleAssignment: singleAssignment;
  ngOnChanges(changes: SimpleChanges) {
    let currenAssignment: singleAssignment =
      changes.singleAssignment.currentValue;
    this.assignmentStatus = {
      startDate: currenAssignment.startDate,
      endDate: currenAssignment.endDate,
      isGraded: !!currenAssignment?.grade,
    };
    console.log(this.assignmentStatus);
  }
  assignmentStatus: AssignmentStatusInput;
}
