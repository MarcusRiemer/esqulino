import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import * as jwt_decode from 'jwt-decode';

@Component({
  templateUrl: './templates/auth-dialog.html'
})
export class AuthDialogComponent {
  constructor(
    private _dialogRef: MatDialogRef<AuthDialogComponent>,
    private _http: HttpClient
  ) {}

  public register: boolean = false;
  public readonly provider = ['Google', 'Github']

  public readonly general = new FormGroup({
    email: new FormControl('', [
      Validators.email, Validators.required
    ]),
    password: new FormControl('', [
      Validators.minLength(6), Validators.required
    ])
  })

  public onNoClick(): void {
    this._dialogRef.close();
  }

  public onChange(): void {
    this.register = !this.register;
  }

  public onSend(): void {
    let headers = new HttpHeaders().set('Authorization',  `Bearer dasdasdasdasd`)
    this._http.post<{["token"]: string}>('/api/auth/developer/callback', 
    { "name": "email", "email": "tom.hilge"}, {headers: headers}).subscribe(log => console.log(jwt_decode(log.token)))
  }

  public static show(dialog: MatDialog) {
    dialog.open(AuthDialogComponent, {
      width: '800px',
      height: '400px'
    });
  }
}