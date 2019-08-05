import { Component, OnInit } from '@angular/core';

import { UserService } from '../../../shared/auth/user.service';
import { ChangePrimaryEmailDescription, ServerProviderDescription } from '../../../shared/auth/provider.description';

@Component({
  selector: "email-settings",
  templateUrl: '../templates/email-settings.html'
})
export class EmailSettingsComponent implements OnInit {
  public identities$ = this._userService.identities$;

  constructor(
    private _userService: UserService,
  ) { }

  public primaryEmailData: ChangePrimaryEmailDescription = {
    primaryEmail: "Please add an e-mail to your account"
  };
  //All distinct e-mails from all providers  
  public emails: Set<string> = new Set();
  public identities: ServerProviderDescription;

  // TODO-TOM move code into template / Promise
  public ngOnInit(): void {
    this.identities$.value.subscribe(
      identities => {
        this.identities = identities;
        this.primaryEmailData.primaryEmail = identities.primary;
        this.identities.providers.forEach(v => {
          if (v.email)
            this.emails.add(v.email)
        })
      }
    )
  }

  public isPrimaryEmailChange(): boolean {
    return this.identities.providers.some(v => v.changes.primary !== undefined && v.changes.primary !== null)
  }

  public onChangePrimaryEmail(): void {
    if (this.emails.has(this.primaryEmailData.primaryEmail)) {
      this._userService.sendChangePrimaryEmail$(this.primaryEmailData)
        .subscribe()

    }
  }
}