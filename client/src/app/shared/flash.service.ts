import { Injectable } from "@angular/core";

/**
 * A message that should be displayed.
 */
export interface FlashMessage {
  caption: string;
  text: string;
  type: "success" | "info" | "warning" | "danger";
}

/**
 * Allows to show brief messages to users.
 */
@Injectable()
export class FlashService {
  private _messages: FlashMessage[] = [];

  /**
   * Adds a new message that is presented to the user.
   */
  addMessage(msg: FlashMessage) {
    this._messages.push(msg);

    console.log(`Added Message: ${JSON.stringify(msg)}`);
  }

  /**
   * @return All messages that should currently be shown.
   */
  get messages(): FlashMessage[] {
    return this._messages;
  }

  /**
   * Removing a specific message.
   */
  removeMessage(index: number) {
    this._messages.splice(index, 1);
  }
}
