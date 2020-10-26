import { Routes, RouterModule } from "@angular/router";

import { frontRoutes } from "./front/front.routes";
import { IsAdminGuard } from "./shared/guards/is-admin.guard";

const AppRoutes: Routes = [
  {
    path: "editor/:projectId",
    loadChildren: () =>
      import("./editor/editor.module").then((m) => m.EditorModuleWithRoutes),
  },
  {
    path: "about",
    children: frontRoutes,
  },
  {
    path: "user",
    loadChildren: () => import("./user/user.module").then((m) => m.UserModule),
  },
  {
    // The admin module has a few heavyweight dependencies and is
    // therefore not bundled with the main application.
    path: "admin",
    loadChildren: () =>
      import("./admin/admin.module").then((m) => m.AdminModule),
    canActivate: [IsAdminGuard],
  },
  {
    path: "",
    redirectTo: "/about",
    pathMatch: "full",
  },
];

// Ensure that "global" parameters (especially the projectId)
// is passed down to the editor modules.
export const routing = RouterModule.forRoot(AppRoutes, {
  paramsInheritanceStrategy: "always",
  initialNavigation: "enabled",
});
