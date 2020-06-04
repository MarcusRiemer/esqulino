import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { DatabaseEmptyComponent } from "./database-empty.component";
import { SidebarItemHost } from "./sidebar-item-host.component";

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule],
  declarations: [DatabaseEmptyComponent, SidebarItemHost],
  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DatabaseEmptyComponent,
    SidebarItemHost,
  ],
})
export class EditorSharedComponentsModule {}
