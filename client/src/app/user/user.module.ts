import { NgModule } from "@angular/core";

import { SharedAppModule } from "../shared/shared.module";

import { userRouting } from "./user.routes";
import { UserComponent } from "./user.component";
@NgModule({
  imports: [SharedAppModule, userRouting],
  declarations: [UserComponent],
  exports: [UserComponent],
})
export class UserModule {}
