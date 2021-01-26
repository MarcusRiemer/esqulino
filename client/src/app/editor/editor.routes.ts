import { Routes, RouterModule } from "@angular/router";

import { EditorComponent } from "./editor.component";

import { SettingsComponent } from "./project-settings/settings.component";

import { ProjectExistsGuard } from "./project-exists.guard";

import { imageEditorRoutes } from "./image/image.routes";
import { codeEditorRoutes } from "./code/code.routes";

export const editorRoutes: Routes = [
  {
    path: "",
    component: EditorComponent,
    canActivate: [ProjectExistsGuard],
    children: [
      {
        path: "",
        redirectTo: "settings",
        pathMatch: "full",
      },
      {
        path: "settings",
        component: SettingsComponent,
      },
      {
        path: "schema",
        loadChildren: () =>
          import("./schema/schema.module").then((m) => m.SchemaEditorModule),
      },
      {
        path: "ast",
        children: [...codeEditorRoutes],
      },
      {
        path: "image",
        children: [...imageEditorRoutes],
      },
    ],
  },
];

export const editorRouting = RouterModule.forChild(editorRoutes);
