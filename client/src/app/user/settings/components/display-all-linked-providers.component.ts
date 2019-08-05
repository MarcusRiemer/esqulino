import { Component, OnInit } from "@angular/core";

import { ProviderDescription } from '../../../shared/auth/provider.description';
import { UserService } from '../../../shared/auth/user.service';

@Component({
  selector: "display-all-linked-providers",
  templateUrl: "../templates/display-all-linked-providers.html"
})
export class DisplayAllLinkedProvidersComponent implements OnInit {
  constructor(
    private _userService: UserService,
  ) {}

  public primary: string;
  public providers: ProviderDescription[];

  public ngOnInit(): void {
    this._userService.primaryEmail$.subscribe(
      primary => this.primary = primary
    )
    // TODO: ASK MARCUS
    this._userService.providers$.subscribe(
      providers => this.providers = providers
    )
  }

  private anotherProviderWithSameEmail(identity: ProviderDescription): boolean {
    return this.providers.some(v =>
      v.email === identity.email && v.type !== identity.type
    )
  }

  public onDeleteIdentity(identity: ProviderDescription): void {
    // If current providers mail is different to the current primary mail
    // or there existing an another provider with the same mail as the primary,
    // delete the clicked identity
    if (
      identity.email !== this.primary && this.primary !== undefined
      || this.anotherProviderWithSameEmail(identity) && identity.email === this.primary
    ) {
      if (this.providers.length > 1) {
        this._userService.deleteEmail$(identity.id).subscribe();
      } else alert("Es muss eine E-Mail vorhanden bleiben.")
    } else alert("Wähle zuvor eine andere primäre E-mail aus!")
  }
}