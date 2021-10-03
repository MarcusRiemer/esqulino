import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CourseService } from "../../course.service";

@Component({ templateUrl: "./editor-code-resource-teacher.component.html" })
export class EditorCodeResourceTeacherComponent {
  constructor(
    private readonly _courseService: CourseService,
    private readonly _activatedRoute: ActivatedRoute
  ) {}
}
