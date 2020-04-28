import { ElementRef, Injectable } from "@angular/core";
import {
  ComponentType,
  ConnectionPositionPair,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
} from "@angular/cdk/overlay";
import { ComponentPortal } from "@angular/cdk/portal";

@Injectable()
export class ServerTaskOverlayService {
  constructor(private _overlay: Overlay) {}

  open(comp: ComponentType<any>, connectedTo: ElementRef) {
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(connectedTo)
      .withPositions([
        {
          originX: "start",
          originY: "bottom",
          overlayX: "start",
          overlayY: "top",
        },
        {
          originX: "start",
          originY: "bottom",
          overlayX: "start",
          overlayY: "bottom",
        },
      ]);

    const overlayRef = this._overlay.create({
      hasBackdrop: true,
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });

    // Create ComponentPortal that can be attached to a PortalHost
    const filePreviewPortal = new ComponentPortal(comp);

    // Attach ComponentPortal to PortalHost
    overlayRef.attach(filePreviewPortal);

    overlayRef.backdropClick().subscribe(() => overlayRef.detach());
  }
}
