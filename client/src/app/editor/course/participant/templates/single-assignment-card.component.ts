import { Component, Input } from "@angular/core";

interface singleAssignment {
  id: string;
  name: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  grade?: string;
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
}
