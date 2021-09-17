import { NgModule } from "@angular/core";

import { SharedAppModule } from "../shared/shared.module";

import { userRouting } from "./user.routes";
import { UserComponent } from "./user.component";
import { OwnProjectsOverviewComponent } from "./own-projects-overview.component";
import { CreateProjectComponent } from "./create-project.component";
import { frontRouting } from "../front/front.routes";
import { ListCorusesOverviewComponent } from "./list-courses-overview.component";

@NgModule({
  imports: [SharedAppModule, userRouting],
  declarations: [
    UserComponent,
    OwnProjectsOverviewComponent,
    CreateProjectComponent,
    ListCorusesOverviewComponent,
  ],
  exports: [UserComponent],
})
export class UserModule {}
