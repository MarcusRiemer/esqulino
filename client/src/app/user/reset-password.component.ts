import { UserService } from './../shared/auth/user.service';
import { UserPasswordDescription } from './../shared/auth/user.description';

import { TemplateRef, AfterViewChecked, AfterContentInit, OnInit } from '@angular/core';
import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { MatDialog, MatSnackBar } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';




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
    email: this._activeRoute.snapshot.queryParams["email"],
    token: this._activeRoute.snapshot.queryParams["token"]
  }


  // TODO-TOM ASK MARCUS FOR A BETTER METHOD THAN setTimeout
  public ngAfterViewInit(): void {
    setTimeout(() => {
      this._dialog.open(this.dialog).afterClosed()
        .subscribe(_ => {
          this._router.navigate(['/'])
        });
    });
  }

  public onResetButton(): void {
    this._userService.resetPassword$(this.resetPasswordData).subscribe(
      _ => {
        this._dialog.closeAll()
        this._snackBar.open('Password succesfully updated', "", { duration: 3000 })
      },
      (err) => {
        alert(`Error: ${err["error"]["error"]}`)
      }
    )
  }
}