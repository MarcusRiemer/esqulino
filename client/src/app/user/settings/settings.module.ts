import { NgModule } from "@angular/core";

import { UserSettingsComponent } from "./settings.component";
import { SharedAppModule } from "../../shared/shared.module";

import { userSettingsRouting } from "./settings.routes";
import { EmailSettingsComponent } from "./components/email-settings.component";
import { ChangeUsernameComponent } from "./components/change-username.component";
import { ProviderLinkingComponent } from "./components/link-provider.component";
import { DisplayAllLinkedProvidersComponent } from "./components/display-all-linked-providers.component";
import { AccountSettingsComponent } from "./components/account-settings.component";
import { AddEmailDialogComponent } from "./components/add-email-dialog.component";

@NgModule({
  declarations: [
    UserSettingsComponent,
    AccountSettingsComponent,
    EmailSettingsComponent,
    ChangeUsernameComponent,
    DisplayAllLinkedProvidersComponent,
    ProviderLinkingComponent,
    AddEmailDialogComponent,
  ],
  imports: [SharedAppModule, userSettingsRouting],
  exports: [
    UserSettingsComponent,
    AccountSettingsComponent,
    EmailSettingsComponent,
    ChangeUsernameComponent,
    DisplayAllLinkedProvidersComponent,
    ProviderLinkingComponent,
  ],
  entryComponents: [AddEmailDialogComponent],
})
export class UserSettingsModule {}
