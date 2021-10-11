import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { first, map, tap } from "rxjs/operators";
import {
  DestroyProjectCourseParticipationGQL,
  RemoveMemberFromParticipantGroupGQL,
} from "../../../../../generated/graphql";
import { MessageDialogComponent } from "../../../../shared/message-dialog.component";
import { SidebarService } from "../../../sidebar.service";
import { EditorToolbarService } from "../../../toolbar.service";
import { CourseService } from "../../course.service";
import { ParticipantMemberGroupDialogComponent } from "./dialog/participant-member-group-dialog.component";

@Component({
  templateUrl: "overview-participant.component.html",
})
export class OverviewParticipantComponent implements OnInit {
  constructor(
    private readonly _courseService: CourseService,
    private readonly _toolbarService: EditorToolbarService,
    private readonly _sidebarService: SidebarService,
    private readonly _mutDestroyProjectCourseParticipation: DestroyProjectCourseParticipationGQL,
    private readonly _mutRemoveMemberFromParticipantGroup: RemoveMemberFromParticipantGroupGQL,
    private readonly _matDialog: MatDialog,
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _router: Router
  ) {}

  ngOnInit(): void {
    // Ensure sane default state
    this._sidebarService.hideSidebar();
    this._toolbarService.resetItems();
    this._toolbarService.savingEnabled = false;

    const btnCreateGroup = this._toolbarService.addButton(
      "create",
      "Gruppe erstellen",
      "user",
      undefined,
      undefined
    );
    const refCloneGroup = btnCreateGroup.onClick.subscribe((_) => {
      this._router.navigate(["participants/create/group"], {
        relativeTo: this._activatedRoute.parent,
      });
    });

    const btnCreateGroups = this._toolbarService.addButton(
      "create",
      "Gruppen erstellen",
      "users",
      undefined,
      undefined
    );
    const refCloneGroups = btnCreateGroups.onClick.subscribe((_) => {
      this._router.navigate(["participants/create/groups"], {
        relativeTo: this._activatedRoute.parent,
      });
    });
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

  onOpenGroupMemberDialog(groupId: string) {
    this._matDialog.open(ParticipantMemberGroupDialogComponent, {
      data: { groupId },
    });
  }

  groups$ = this._courseService.fullCourseData$.pipe(
    map((courseData) =>
      courseData.participantProjects.map((project) => ({
        id: project.id,
        numberOfMember: project.projectMembers?.length,
        numberOfMaxMember: courseData.maxGroupSize,
        groupName: project.name,
        memberName: project.projectMembers
          .map((member) => member.user.displayName)
          .join(", "),
      }))
    )
  );

  async onDeleteGroup(groupId: string) {
    const confirmed = await MessageDialogComponent.confirm(this._matDialog, {
      description: $localize`:@@message.ask-delete-resource:Soll die Gruppe wirklich gelöscht werden?`,
    });

    if (confirmed) {
      this._mutDestroyProjectCourseParticipation
        .mutate({ groupId: groupId })
        .pipe(first())
        .toPromise();
    }
  }

  async onRemoveMember(groupId: string, userId: string) {
    const confirmed = await MessageDialogComponent.confirm(this._matDialog, {
      description: $localize`:@@message.ask-delete-resource:Soll der User wirklich aus der Gruppe entfernt werden?`,
    });

    if (confirmed) {
      this._mutRemoveMemberFromParticipantGroup
        .mutate({ groupId, userId })
        .pipe(first())
        .toPromise();
    }
  }

  groupsDisplayedColumns: string[] = [
    "name",
    "numberOfMember",
    "memberNames",
    "actions",
  ];

  displayedColumns: string[] = [
    "name",
    "group",
    "role",
    "joinedAt",
    "mail",
    "actions",
  ];
}
