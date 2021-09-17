import { RouterModule, Routes } from "@angular/router";

import { LoggedInGuard } from "./../shared/guards/logged-in.guard";

import { UserComponent } from "./user.component";
import { OwnProjectsOverviewComponent } from "./own-projects-overview.component";
import { CreateProjectComponent } from "./create-project.component";
import { ListCorusesOverviewComponent } from "./list-courses-overview.component";

export const userRoutes: Routes = [
  {
    path: "",
    component: UserComponent,
    runGuardsAndResolvers: "always",
    children: [
      {
        path: "settings",
        canActivate: [LoggedInGuard],
        loadChildren: () =>
          import("./settings/settings.module").then(
            (m) => m.UserSettingsModule
          ),
      },
      {
        path: "projects",
        component: OwnProjectsOverviewComponent,
      },
      {
        path: "courses",
        component: ListCorusesOverviewComponent,
      },
      {
        path: "create/project",
        component: CreateProjectComponent,
      },
    ],
  },
];

export const userRouting = RouterModule.forChild(userRoutes);
