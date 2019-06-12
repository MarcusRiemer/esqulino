import { NgModule } from "@angular/core";

import { SharedAppModule } from '../shared/shared.module';
import { UserProfilComponent } from './user-profil.component';
import { ResetPasswordComponent } from './reset-password.component';
import { userRouting } from './user.routes';
import { UserComponent } from './user.component';


@NgModule({
  imports: [
    SharedAppModule,
    userRouting
  ],
  declarations: [
    UserComponent,
    UserProfilComponent,
    ResetPasswordComponent
  ],
  exports: [
    UserComponent,
    UserProfilComponent,
    ResetPasswordComponent,
  ],
  entryComponents: [ResetPasswordComponent]
})
export class UserModule {}