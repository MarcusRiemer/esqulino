import { AccountSettingsComponent } from './components/account-settings.component';
import { NgModule } from "@angular/core";

import { UserSettingsComponent } from './settings.component';
import { SharedAppModule } from '../../shared/shared.module';

import { userSettingsRouting } from './settings.routes';
import { SecuritySettingsComponent } from './components/security-settings.component';
import { EmailSettingsComponent } from './components/email-settings.component';

@NgModule({
  declarations: [
    UserSettingsComponent,
    AccountSettingsComponent,
    SecuritySettingsComponent,
    EmailSettingsComponent
  ],
  imports: [
    SharedAppModule,
    userSettingsRouting
  ],
  exports: [
    UserSettingsComponent,
    SecuritySettingsComponent,
    AccountSettingsComponent,
    EmailSettingsComponent
  ],
})
export class UserSettingsModule {}