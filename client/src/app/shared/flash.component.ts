import { Component, Input } from "@angular/core";

import { FlashService } from "./flash.service";

@Component({
  selector: "flash-message-list",
  templateUrl: "templates/flash-message-list.html",
})
export class FlashMessageListComponent {
  @Input() test: any;

  constructor(private _flashService: FlashService) {}

  /**
   * @return All messages that should currently be displayed.
   */
  get messages() {
    return this._flashService.messages;
  }

  onClose(index: number) {
    this._flashService.removeMessage(index);
  }
}
