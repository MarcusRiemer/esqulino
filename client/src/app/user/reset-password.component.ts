import { TemplateRef } from "@angular/core";
import { Component, AfterViewInit, ViewChild } from "@angular/core";
import { MatDialog, MatSnackBar } from "@angular/material";
import { Router, ActivatedRoute } from "@angular/router";

import { UserService } from "../shared/auth/user.service";
import { UserPasswordDescription } from "../shared/auth/user.description";
import { first } from "rxjs/operators";

@Component({
  templateUrl: "./templates/reset-password.html"
})
export class ResetPasswordComponent implements AfterViewInit {
  @ViewChild("dialog", { static: true }) dialog: TemplateRef<MatDialog>;

  constructor(
    private _dialog: MatDialog,
    private _router: Router,
    private _activeRoute: ActivatedRoute,
    private _userService: UserService,
    private _snackBar: MatSnackBar
  ) { }

  public resetPasswordData: UserPasswordDescription = {
    password: undefined,
    confirmedPassword: undefined,
    token: this._activeRoute.snapshot.paramMap.get("token")
  };

  /**
   * Opening a dialog for reset password
   */
  public ngAfterViewInit(): void {
    this._dialog
      .open(this.dialog)
      .afterClosed()
      .pipe(first())
      .subscribe(_ => {
        this._router.navigate(["/"]);
      });
  }

  /**
   * Resetting password
   */
  public onResetButton(): void {
    this._userService
      .resetPassword$(this.resetPasswordData)
      .subscribe(_ => {
        this._dialog.closeAll();
        this._snackBar.open("Password succesfully updated", "", {
          duration: 3000
        });
      });
  }
}
