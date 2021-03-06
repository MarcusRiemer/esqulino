import { Routes } from "@angular/router";

import { UnknownCodeResourceComponent } from "./unknown-code-resource.component";

import { BlockEditorComponent } from "./block/block-editor.component";

import { ResourceChangedGuard } from "./resource-changed.guard";
import { QueryStepwiseComponent } from "./query/query-stepwise.component";
import { CreateOverviewComponent } from "./create-overview.component";

export const codeEditorRoutes: Routes = [
  {
    path: "create",
    pathMatch: "full",
    component: CreateOverviewComponent,
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
    path: ":resourceId/sql-steps",
    canActivate: [ResourceChangedGuard],
    component: QueryStepwiseComponent,
  },
  {
    path: ":resourceId/blockly",
    canActivate: [ResourceChangedGuard],
    component: BlockEditorComponent,
  },
  {
    path: ":resourceId/unknown",
    component: UnknownCodeResourceComponent,
  },
];
