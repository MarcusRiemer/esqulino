import { Component, OnInit } from "@angular/core";
import { first, map, tap } from "rxjs/operators";
import { SidebarService } from "../../../sidebar.service";
import { EditorToolbarService } from "../../../toolbar.service";
import { CourseService } from "../../course.service";

@Component({
  templateUrl: "overview-participant.component.html",
})
export class OverviewParticipantComponent implements OnInit {
  constructor(
    private readonly _courseService: CourseService,
    private _toolbarService: EditorToolbarService,
    private _sidebarService: SidebarService
  ) {}

  ngOnInit(): void {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
  }

  //TODO TYPEN
  participants$ = this._courseService.fullCourseData$.pipe(
    map((courseData) => {
      let toReturn = [];
      courseData.participantProjects.forEach((pProject) => {
        pProject.projectMembers.forEach((member) => {
          toReturn.push({
            name: member.user.displayName,
            userId: member.user.id,
            groupName: pProject.name,
            groupId: pProject.id,
            role: member.membershipType,
            joinedAt: member.joinedAt,
          });
        });
      });
      return toReturn;
    })
  );

  displayedColumns: string[] = [
    "actions",
    "name",
    "group",
    "role",
    "joinedAt",
    "mail",
  ];
}
