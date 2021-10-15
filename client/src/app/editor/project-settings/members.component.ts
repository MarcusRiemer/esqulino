import { Component } from "@angular/core";
import { Observable } from "rxjs";
import { filter, first, map, pluck, switchMap } from "rxjs/operators";

import {
  FullProjectGQL,
  ProjectAddMemberGQL,
  ProjectChangeMemberRoleGQL,
  ProjectChangeOwnerGQL,
  ProjectRemoveMemberGQL,
} from "../../../generated/graphql";

import { ProjectService } from "../project.service";
import { User } from "@sentry/types";
import { PerformDataService } from "../../shared/authorisation/perform-data.service";
import { FormBuilder, FormGroup } from "@angular/forms";

interface ProjectMember {
  id: string;
  displayName: string;
  roleName: string;
  joinedAt: Date;
  changedRole: string;
}

@Component({
  templateUrl: "templates/members.html",
  selector: "project-members",
})
export class MembersComponent {
  /**
   * Used for dependency injection.
   */
  constructor(
    private readonly _projectService: ProjectService,
    private readonly _fullProjectQuery: FullProjectGQL,
    private readonly _mutAddMember: ProjectAddMemberGQL,
    private readonly _mutRemoveMember: ProjectRemoveMemberGQL,
    private readonly _mutChangeOwner: ProjectChangeOwnerGQL,
    private readonly _mutChangeMemberRole: ProjectChangeMemberRoleGQL,
    private readonly _performData: PerformDataService,
    private readonly _formBuilder: FormBuilder
  ) {}

  /**
   * Necessary for the material table
   */
  readonly displayedColumns: string[] = [
    "displayName",
    "roleName",
    "joinedAt",
    "actions",
  ];

  addMemberForm: FormGroup = this._formBuilder.group({
    addMemberId: [],
    addMemberRole: ["participant"],
  });

  changeOwnerForm: FormGroup = this._formBuilder.group({
    changeOwnerId: [],
  });

  /**
   * These permissions are required to add a member
   */
  private readonly _fullProject$ = this._projectService.activeProjectId$.pipe(
    switchMap((id) => this._fullProjectQuery.watch({ id }).valueChanges),
    filter((response) => !response.loading),
    pluck("data", "project")
  );

  /**
   * These permissions are required to add a member
   */
  readonly addMemberPermission$ = this._projectService.activeProject.pipe(
    map((p) => this._performData.project.addMember(p.id))
  );

  /**
   * These permissions are required to change the Owner
   */
  readonly changeOwnerPermission$ = this._projectService.activeProject.pipe(
    map((p) => this._performData.project.changeOwner(p.id))
  );

  /**
   * These permissions are required to change a member role
   */
  readonly changeMemberRolePermission$ =
    this._projectService.activeProject.pipe(
      map((p) => this._performData.project.changeMemberRole(p.id))
    );

  /**
   * These permissions are required to remove a member
   */
  readonly removeMemberPermission$ = this._projectService.activeProject.pipe(
    map((p) => this._performData.project.removeMember(p.id))
  );

  readonly owner$ = this._fullProject$.pipe(pluck("user"));

  readonly members$: Observable<ProjectMember[]> = this._fullProject$.pipe(
    pluck("projectMembers"),
    map((members) => {
      return members.map((singleMember) => ({
        id: singleMember.user.id,
        displayName: singleMember.user.displayName,
        roleName: singleMember.membershipType,
        joinedAt: singleMember.joinedAt
          ? new Date(singleMember.joinedAt)
          : null,
        changedRole: singleMember.membershipType,
      }));
    })
  );

  /**
   * Add a new User to this Project.
   * Don´t work if the user is the owner.
   */
  async onAddMember() {
    const projectId = await this._projectService.activeProjectId$
      .pipe(first())
      .toPromise();

    await this._mutAddMember
      .mutate({
        projectId,
        isAdmin: this.addMemberForm.get("addMemberRole").value == "admin",
        userIds: [this.addMemberForm.get("addMemberId").value],
      })
      .pipe(first())
      .toPromise();

    //Clean the Field
    this.addMemberForm.get("addMemberId").reset();
  }

  /**
   * Remove a Member from this project.
   */
  async onRemoveMember(user: User) {
    const projectId = await this._projectService.activeProjectId$
      .pipe(first())
      .toPromise();

    await this._mutRemoveMember
      .mutate({
        projectId,
        userId: user.id,
      })
      .pipe(first())
      .toPromise();
  }

  tranformDate(date) {
    return date.toLocaleDateString("de-DE");
  }

  /**
   * Change the Role of a existing Member from this project
   */
  async onChangeMemberRole(user: User, role: string) {
    const projectId = await this._projectService.activeProjectId$
      .pipe(first())
      .toPromise();

    await this._mutChangeMemberRole
      .mutate({
        projectId,
        isAdmin: role === "admin",
        userId: user.id,
      })
      .pipe(first())
      .toPromise();
  }

  /**
   * Change the Owner from this Project.
   * The old Owner will get the role admin.
   */
  async onChangeOwner() {
    const projectId = await this._projectService.activeProjectId$
      .pipe(first())
      .toPromise();

    await this._mutChangeOwner
      .mutate({
        projectId,
        userId: this.changeOwnerForm.get("changeOwnerId").value,
      })
      .pipe(first())
      .toPromise();

    //Clean the Field
    this.changeOwnerForm.reset();
  }
}

//          Pull     | Push
//Single   call()    | Promise
//        -----------+-----------
//Multi    Iterator  | Observable
//
//
