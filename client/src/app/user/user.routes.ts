import { RouterModule, Routes } from "@angular/router";

import { UserComponent } from "./user.component";
import { LoggedInGuard } from "./../shared/guards/logged-in.guard";

export const userRoutes: Routes = [
  {
    path: "",
    component: UserComponent,
    canActivate: [LoggedInGuard],
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
    ],
  },
];

export const userRouting = RouterModule.forChild(userRoutes);
