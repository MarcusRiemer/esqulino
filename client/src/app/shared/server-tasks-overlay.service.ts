import { Injectable } from "@angular/core";
import {
  CloseScrollStrategy,
  ComponentType,
  Overlay,
  OverlayConfig,
} from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";

@Injectable()
export class ServerTaskOverlayService {
  private _config = new OverlayConfig({
    hasBackdrop: true,
    backdropClass: "cdk-overlay-transparent-backdrop",
  });

  constructor(private overlay: Overlay) {}

  open(comp: ComponentType<any>, event: MouseEvent) {
    this._config.positionStrategy = this.overlay
      .position()
      .global()
      .left(event.clientX + "px")
      .top(event.clientY + "px");
    // Returns an OverlayRef (which is a PortalHost)
    const overlayRef = this.overlay.create(this._config);

    // Create ComponentPortal that can be attached to a PortalHost
    const filePreviewPortal = new ComponentPortal(comp);

    // Attach ComponentPortal to PortalHost
    overlayRef.attach(filePreviewPortal);

    overlayRef.backdropClick().subscribe(() => overlayRef.detach());
  }
}
