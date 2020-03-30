import { NgModule } from "@angular/core";

import { SharedAppModule } from "../shared/shared.module";
import { ResetPasswordComponent } from "./reset-password.component";
import { userRouting } from "./user.routes";
import { UserComponent } from "./user.component";
@NgModule({
  imports: [SharedAppModule, userRouting],
  declarations: [UserComponent, ResetPasswordComponent],
  exports: [UserComponent, ResetPasswordComponent],
  entryComponents: [ResetPasswordComponent],
})
export class UserModule {}
