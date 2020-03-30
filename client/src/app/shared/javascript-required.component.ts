import { isPlatformServer } from "@angular/common";
import { Component, PLATFORM_ID, Inject, Input } from "@angular/core";

/**
 * Wrapper component
 * Should be used if Javascript is disabled
 */
@Component({
  selector: "app-requires-javascript",
  templateUrl: "./templates/javascript-required-wrapper.html",
})
export class JavascriptRequiredComponent {
  @Input() readonly forceDisplay: boolean;
  constructor(
    @Inject(PLATFORM_ID)
    private readonly _platformId: Object
  ) {}

  readonly jsDisabled: boolean = isPlatformServer(this._platformId);
}
