import { RouterModule, Routes } from "@angular/router";

import { LoggedInGuard } from "./../shared/guards/logged-in.guard";

import { UserComponent } from "./user.component";
import { OwnProjectsOverviewComponent } from "./own-projects-overview.component";

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
    ],
  },
];

export const userRouting = RouterModule.forChild(userRoutes);
