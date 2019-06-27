import { Component } from "@angular/core";
import { first } from 'rxjs/operators';

import { ProviderDescription, ServerProviderDescription } from '../../../shared/auth/provider.description';
import { UserService } from '../../../shared/auth/user.service';
import { providers } from '../../../shared/auth/providers';

@Component({
  selector: "display-all-linked-providers",
  templateUrl: "../templates/display-all-linked-providers.html"
})
export class DisplayAllLinkedProvidersComponent {
  constructor(
    private _userService: UserService,
  ) {
    this._userService.identities$.value.pipe(
      first()
    ).subscribe(
      identities => this.identities = identities
    )
  }


  public identities: ServerProviderDescription;

  private anotherProviderWithSameEmail(identity: ProviderDescription): boolean {
    return this.identities.providers.some(v =>
      v.email === identity.email && v.type !== identity.type
    )
  }

  public onDeleteIdentity(identity: ProviderDescription, primary: string): void {
    // If current providers mail is different to the current primary mail
    // or there existing an another provider with the same mail as the primary,
    // delete the clicked identity
    if (
      identity.email !== primary
      || this.anotherProviderWithSameEmail(identity) && identity.email === primary
    ) {
      if (this.identities.providers.length > 1) {
        this._userService.deleteEmail$(identity.id).subscribe();
      } else alert("Es muss eine E-Mail vorhanden bleiben.")
    } else alert("Wähle zuvor eine andere primäre E-mail aus!")
  }
}