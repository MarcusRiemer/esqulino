import {BehaviorSubject, ReplaySubject} from "rxjs";
import {generateUUIDv4} from "../util-browser";
import {ServerTask, ServerTaskState} from "./server-tasks.service";

/**
 * A server side operation that is explicitly managed by calling
 * `succeeded` and `failed`.
 */
export class ServerTaskManual implements ServerTask {
  private _state$ = new ReplaySubject<ServerTaskState>(1);

  readonly state$ = this._state$.asObservable();

  readonly createdAt: number;

  readonly id: string;

  constructor(readonly description: string) {
    this.id = generateUUIDv4();
    this.createdAt = Date.now();
    this._state$.next({type:"pending"});
  }

  get state() {
    return this._state$._getNow();
  }

  public succeeded() {
    this._state$.next({ type: "success" });
    this._state$.complete();
  }

  public failed(message: string) {
    this._state$.next({ type: "failure", message });
    this._state$.complete();
  }
}