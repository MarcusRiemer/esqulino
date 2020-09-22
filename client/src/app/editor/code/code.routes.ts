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
    redirectTo: ":resourceId/blockly",
    pathMatch: "full",
  },
  {
    path: ":resourceId/block",
    canActivate: [ResourceChangedGuard],
    component: BlockEditorComponent,
  },
  {
    path: ":resourceId/blockly",
    loadChildren: () =>
      import("./blockly/blockly.module").then((m) => m.BlocklyEditorModule),
  },
  {
    path: ":resourceId/unknown",
    component: UnknownCodeResourceComponent,
  },
];
