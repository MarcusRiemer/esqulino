import { AccountSettingsComponent } from './components/account-settings.component';
import { NgModule } from "@angular/core";

import { UserSettingsComponent } from './settings.component';
import { SharedAppModule } from 'src/app/shared/shared.module';

import { userSettingsRouting } from './settings.routes';

@NgModule({
  declarations: [
    UserSettingsComponent,
    AccountSettingsComponent
  ],
  imports: [
    SharedAppModule,
    userSettingsRouting
  ],
  exports: [
    UserSettingsComponent,
    AccountSettingsComponent
  ],
})
export class UserSettingsModule {}