import { Routes } from "@angular/router";

import { CreateCodeResourceComponent } from "./create-code-resource.component";
import { UnknownCodeResourceComponent } from "./unknown-code-resource.component";

import { BlockEditorComponent } from "./block/block-editor.component";

import { ResourceChangedGuard } from "./resource-changed.guard";

export const codeEditorRoutes: Routes = [
  {
    path: "create",
    pathMatch: "full",
    component: CreateCodeResourceComponent,
  },
  {
    path: ":resourceId",
    redirectTo: ":resourceId/block",
    pathMatch: "full",
  },
  {
    path: ":resourceId/block",
    canActivate: [ResourceChangedGuard],
    component: BlockEditorComponent,
  },
  {
    path: ":resourceId/unknown",
    component: UnknownCodeResourceComponent,
  },
];
