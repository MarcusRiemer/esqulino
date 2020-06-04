import { Component, Injector, ReflectiveInjector } from "@angular/core";
import { ComponentPortal } from "@angular/cdk/portal";

import { map } from "rxjs/operators";

import { SIDEBAR_MODEL_TOKEN, SIDEBAR_ID_TOKEN } from "./editor.token";
import { SidebarService } from "./sidebar.service";

/**
 * Shows the correct type of sidebar depending on the URL
 */
@Component({
  selector: "sidebar-loader",
  templateUrl: "./templates/sidebar-loader.html",
})
export class SidebarLoaderComponent {
  /**
   * Used for dependency injection
   */
  constructor(
    private _sidebarService: SidebarService,
    private _injector: Injector
  ) {}

  readonly items = this._sidebarService.sidebarModel.pipe(
    map((newModel) => {
      const toReturn = newModel.map((model) => {
        // Find out what type to construct
        const componentType = this._sidebarService.getComponentType(model.type);

        // Possibly inject data
        let injector = this._injector;
        if (model.param) {
          injector = ReflectiveInjector.resolveAndCreate(
            [
              { provide: SIDEBAR_MODEL_TOKEN, useValue: model.param },
              { provide: SIDEBAR_ID_TOKEN, useValue: model.id },
            ],
            this._injector
          );
        }

        // And actually create the component
        return new ComponentPortal(componentType, undefined, injector);
      });

      return toReturn;
    })
  );
}
