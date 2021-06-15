import { NgModule } from "@angular/core";

import { UserSettingsComponent } from "./settings.component";
import { SharedAppModule } from "../../shared/shared.module";

import { userSettingsRouting } from "./settings.routes";
import { DisplayAllLinkedProvidersComponent } from "./display-all-linked-providers.component";
import { AccountSettingsComponent } from "./account-settings.component";
import { UserDetailsComponent } from "./user-details.component";

@NgModule({
  declarations: [
    UserSettingsComponent,
    AccountSettingsComponent,
    DisplayAllLinkedProvidersComponent,
    UserDetailsComponent,
  ],
  imports: [SharedAppModule, userSettingsRouting],
})
export class UserSettingsModule {}
