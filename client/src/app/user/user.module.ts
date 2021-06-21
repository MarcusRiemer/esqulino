import { NgModule } from "@angular/core";

import { SharedAppModule } from "../shared/shared.module";

import { userRouting } from "./user.routes";
import { UserComponent } from "./user.component";
import { OwnProjectsOverviewComponent } from "./own-projects-overview.component";
import { CreateProjectComponent } from "./create-project.component";

@NgModule({
  imports: [SharedAppModule, userRouting],
  declarations: [
    UserComponent,
    OwnProjectsOverviewComponent,
    CreateProjectComponent,
  ],
  exports: [UserComponent],
})
export class UserModule {}
