import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { BlocklyComponent } from "./blockly.component";

import { ResourceChangedGuard } from "../resource-changed.guard";

const routes: Routes = [
  {
    path: "",
    canActivate: [ResourceChangedGuard],
    component: BlocklyComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BlocklyRoutingModule {}
