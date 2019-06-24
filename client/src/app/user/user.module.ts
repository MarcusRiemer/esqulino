import { NgModule } from "@angular/core";

import { SharedAppModule } from '../shared/shared.module';
import { UserProfilComponent } from './user-profil.component';
import { ResetPasswordComponent } from './reset-password.component';
import { userRouting } from './user.routes';
import { AddEmailDialogComponent } from './settings/components/add-email-dialog.component';
import { UserComponent } from './user.component';


@NgModule({
  imports: [
    SharedAppModule,
    userRouting
  ],
  declarations: [
    UserComponent,
    UserProfilComponent,
    ResetPasswordComponent,
    AddEmailDialogComponent
  ],
  exports: [
    UserComponent,
    UserProfilComponent,
    ResetPasswordComponent,
    AddEmailDialogComponent,
  ],
  entryComponents: [ResetPasswordComponent, AddEmailDialogComponent],
})
export class UserModule {}