import { Component } from "@angular/core";

import { UserService } from "../../../shared/auth/user.service";
import {
  ChangePrimaryEmailDescription,
  ServerProviderDescription,
} from "../../../shared/auth/provider.description";
@Component({
  selector: "email-settings",
  templateUrl: "./templates/email-settings.html",
})
export class EmailSettingsComponent {
  constructor(private _userService: UserService) {}

  private _primaryEmailData: ChangePrimaryEmailDescription = {
    primaryEmail: "",
  };

  // All linked identities
  public identities = this._userService.identities;

  public get primaryEmail(): string {
    return this._primaryEmailData.primaryEmail;
  }

  public set primaryEmail(email: string) {
    this._primaryEmailData.primaryEmail = email;
  }

  /**
   * Is the given date earlier than the current
   */
  public isTokenExpired(date: string): boolean {
    return new Date() <= new Date(date);
  }

  public validEmails(identities: ServerProviderDescription): Set<string> {
    //All distinct e-mails from all providers
    const emails: Set<string> = new Set();
    identities.providers.forEach((v) => {
      if (v.email) emails.add(v.email);
    });
    return emails;
  }

  // Must be used, because 2 way data binding does not work in this case
  public onChange(email: string) {
    this.primaryEmail = email;
  }

  /**
   * Changing primary e-mail
   * @param emails distinct, confirmed emails
   */
  public onSave(emails: Set<string>): void {
    if (emails.has(this.primaryEmail)) {
      this._userService
        .sendChangePrimaryEmail$(this._primaryEmailData)
        .subscribe();
    }
  }
}
