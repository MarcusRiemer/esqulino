import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

import { DatabaseEmptyComponent } from "./database-empty.component";

@NgModule({
  imports: [CommonModule, FormsModule, RouterModule],
  declarations: [DatabaseEmptyComponent],
  exports: [CommonModule, FormsModule, RouterModule, DatabaseEmptyComponent],
})
export class EditorSharedComponentsModule {}
