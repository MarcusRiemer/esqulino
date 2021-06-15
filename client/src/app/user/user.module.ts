import { NgModule } from "@angular/core";

import { SharedAppModule } from "../shared/shared.module";

import { userRouting } from "./user.routes";
import { UserComponent } from "./user.component";
import { OwnProjectsOverviewComponent } from './own-projects-overview.component';
@NgModule({
  imports: [SharedAppModule, userRouting],
  declarations: [UserComponent, OwnProjectsOverviewComponent],
  exports: [UserComponent],
})
export class UserModule {}
