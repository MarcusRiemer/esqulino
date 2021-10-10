import { Component, Inject, Input, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { first, map, pluck } from "rxjs/operators";
import {
  AddMemberToGroupGQL,
  CourseListUsersGQL,
  CreateProjectCourseParticipationsGQL,
  RemoveMemberFromParticipantGroupGQL,
  UpdateAssignmentInput,
} from "../../../../../../generated/graphql";
import { CourseService } from "../../../course.service";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { FormControl } from "@angular/forms";

interface ParticipantMemberGroupInput {
  groupId: string;
}

@Component({
  templateUrl: "./participant-member-group-dialog.component.html",
})
export class ParticipantMemberGroupDialogComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: ParticipantMemberGroupInput,
    public dialogRef: MatDialogRef<ParticipantMemberGroupDialogComponent>,
    private readonly _courseService: CourseService,
    private readonly _courseListUsers: CourseListUsersGQL,
    private readonly _mutRemoveMemberFromParticipantGroup: RemoveMemberFromParticipantGroupGQL,
    private readonly _mutAddMemberToGroup: AddMemberToGroupGQL
  ) {}

  async ngOnInit() {
    // this.allPossibleUserNames = this._courseListUsers
    //   .fetch({})
    //   .pipe(first(), pluck("data"))
    //   .toPromise();
    // console.log(this.allPossibleUserNames);
  }

  formControlUserName = new FormControl("");
  allPossibleUserNames;

  readonly displayedColumns: string[] = [
    "name",
    "roleName",
    "joinedAt",
    "actions",
  ];

  async onRemoveMember(userId: string) {
    this._mutRemoveMemberFromParticipantGroup
      .mutate({ groupId: this.data.groupId, userId })
      .pipe(first())
      .toPromise();
  }

  async onAddMemberToGroup() {
    console.log("add");
    this._mutAddMemberToGroup
      .mutate({
        groupId: this.data.groupId,
        userId: this.formControlUserName.value,
        role: "participant",
      })
      .pipe(first())
      .toPromise()
      .then((_) => this.formControlUserName.reset());
  }

  members$ = this._courseService.fullCourseData$.pipe(
    map(
      (course) =>
        course.participantProjects.find(
          (group) => group.id == this.data.groupId
        ).projectMembers
    )
  );
}
