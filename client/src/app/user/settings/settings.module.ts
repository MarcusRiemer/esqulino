import { NgModule } from "@angular/core";

import { UserSettingsComponent } from "./settings.component";
import { SharedAppModule } from "../../shared/shared.module";

import { userSettingsRouting } from "./settings.routes";
import { DisplayAllLinkedProvidersComponent } from "./components/display-all-linked-providers.component";
import { AccountSettingsComponent } from "./components/account-settings.component";

@NgModule({
  declarations: [
    UserSettingsComponent,
    AccountSettingsComponent,
    DisplayAllLinkedProvidersComponent,
  ],
  imports: [SharedAppModule, userSettingsRouting],
})
export class UserSettingsModule {}
