import { ReplaySubject } from "rxjs";
import { ServerTask, ServerTaskState } from "./server-tasks.service";

/**
 * A server side operation that is explicitly managed by calling
 * `succeeded` and `failed`.
 */
export class ServerTaskManual implements ServerTask {
  /**
   * fit("BehaviorSubject completed first, then subscripted", async()=>{
   *  const bs = new BehaviorSubject("1");
   *  bs.next("2");
   *  bs.complete();
   *  const valBs = await bs.pipe(take(1)).toPromise();
   *  expect(valBs).toEqual("2");
   * })
   */
  // https://medium.com/javascript-everyday/behaviorsubject-vs-replaysubject-1-beware-of-edge-cases-b361153d9ccf
  // When state is completed before a subscription was made, a BehaviourSubject would cause errors.
  private _state$ = new ReplaySubject<ServerTaskState>(1);

  readonly state$ = this._state$.asObservable();

  constructor(readonly description: string) {
    this._state$.next({ type: "pending" });
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
