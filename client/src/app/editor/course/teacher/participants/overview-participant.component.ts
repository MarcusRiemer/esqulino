import { Component, OnInit } from "@angular/core";
import { first, map, tap } from "rxjs/operators";
import {
  DestroyProjectCourseParticipationGQL,
  RemoveMemberFromParticipantGroupGQL,
} from "../../../../../generated/graphql";
import { SidebarService } from "../../../sidebar.service";
import { EditorToolbarService } from "../../../toolbar.service";
import { CourseService } from "../../course.service";

@Component({
  templateUrl: "overview-participant.component.html",
})
export class OverviewParticipantComponent implements OnInit {
  constructor(
    private readonly _courseService: CourseService,
    private readonly _toolbarService: EditorToolbarService,
    private readonly _sidebarService: SidebarService,
    private readonly _mutDestroyProjectCourseParticipation: DestroyProjectCourseParticipationGQL,
    private readonly _mutRemoveMemberFromParticipantGroup: RemoveMemberFromParticipantGroupGQL
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

  groups$ = this._courseService.fullCourseData$.pipe(
    map((courseData) =>
      courseData.participantProjects.map((project) => ({
        id: project.id,
        numberOfMember: project.projectMembers?.length,
        numberOfMaxMember: courseData.maxGroupSize,
        groupName: project.name,
        memberName: project.projectMembers
          .map((member) => member.user.displayName)
          .reduce((a, b) => a.toString() + b.toString() + ",", ""),
      }))
    )
  );

  async onDeleteGroup(groupId: string) {
    this._mutDestroyProjectCourseParticipation
      .mutate({ groupId: groupId })
      .pipe(first())
      .toPromise();
  }

  async onRemoveMember(groupId: string, userId: string) {
    this._mutRemoveMemberFromParticipantGroup
      .mutate({ groupId, userId })
      .pipe(first())
      .toPromise();
  }

  groupsDisplayedColumns: string[] = [
    "actions",
    "name",
    "numberOfMember",
    "memberNames",
  ];

  displayedColumns: string[] = [
    "actions",
    "name",
    "group",
    "role",
    "joinedAt",
    "mail",
  ];
}
