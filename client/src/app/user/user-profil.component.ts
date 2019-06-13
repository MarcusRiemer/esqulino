import { Component } from "@angular/core";
import { SideNavService } from '../shared/side-nav.service';
import { userItems } from './user.component';

@Component({
  templateUrl: "./templates/profil.html"
})

export class UserProfilComponent {
  constructor(
    private _sideNavService: SideNavService
  ) {
    this._sideNavService.newSideNav(userItems)
  }
} 