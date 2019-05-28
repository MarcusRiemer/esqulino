import { Injectable } from '@angular/core';

import { ServerDataService } from '../serverdata/server-data.service';
import { map, tap } from 'rxjs/operators';
import { UserDescription } from './user.description';
import { Observable } from 'rxjs';


@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(
    private _serverData: ServerDataService
  ) {}

  public userData = this._serverData.getUserData

  public readonly isLoggedIn = this.userData.value.pipe(
    map(u => u.loggedIn)
  )

  public readonly userDisplayName = this.userData.value.pipe(
    map(u => u.loggedIn? u.displayName : "Guest")
  )

  public onLogout(): Observable<UserDescription> {
    return this._serverData.onLogout()
  }
}