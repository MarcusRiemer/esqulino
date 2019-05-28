import { ServerApi } from './../serverdata/serverapi';
import { Component } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Validators, FormControl, FormGroup } from '@angular/forms';

import { ServerApiService } from '../serverdata/serverapi.service';

@Component({
  templateUrl: './templates/auth-dialog.html'
})
export class AuthDialogComponent {
  constructor(
    private _dialogRef: MatDialogRef<AuthDialogComponent>,
    private _serverApi: ServerApiService,
  ) {}

  public register: boolean = false;
  public readonly providers = [ 
    {
      "name": "Github",
      "urlName": "github"
    },
    {
      "name": "Google",
      "urlName": "google_oauth2"
    },
    {
      "name": "Developer",
      "urlName": "developer"
    }
  ]

  public readonly general = new FormGroup({
    email: new FormControl('', [
      Validators.email, Validators.required
    ]),
    password: new FormControl('', [
      Validators.minLength(6), Validators.required
    ])
  })

  public onClose(): void {
    this._dialogRef.close();
  }

  public onChange(): void {
    this.register = !this.register;
  }

  public onSignIn(provider: string) {
    window.location.href = this._serverApi.getSignInUrl(provider);
  }

  public static showDialog(dialog: MatDialog) {
    dialog.open(AuthDialogComponent, {
      width: '700px',
      height: '340px'
    });
  }
}