import { NgModule } from "@angular/core";

import { SharedAppModule } from '../shared/shared.module';
import { UserProfilComponent } from './user-profil.component';
import { UserComponent } from './user.component';
import { ResetPasswordComponent } from './reset-password.component';


@NgModule({
  imports: [
    SharedAppModule
  ],
  declarations: [
    UserComponent,
    UserProfilComponent,
    ResetPasswordComponent
  ],
  exports: [
    UserComponent,
    UserProfilComponent,
    ResetPasswordComponent
  ],
  entryComponents: [ResetPasswordComponent]
})
export class UserModule {}