import { ModuleWithProviders, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { SharedAppModule } from "../../shared/shared.module";

import { CourseNavComponent } from "./course-nav.component";
import { AssignmentOverviewComponent } from "./assignment-overview.component";

@NgModule({
  imports: [CommonModule, SharedAppModule],
  declarations: [CourseNavComponent, AssignmentOverviewComponent],
  exports: [CourseNavComponent],
})
export class CourseModule {
  public static forRoot(): ModuleWithProviders<CourseModule> {
    return {
      ngModule: CourseModule,
      providers: [],
    };
  }
}
