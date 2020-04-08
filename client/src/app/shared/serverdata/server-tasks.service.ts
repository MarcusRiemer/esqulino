import {Injectable} from "@angular/core";

import {Observable, BehaviorSubject, Subject, of, combineLatest} from "rxjs";
import {
  map,
  scan,
  tap,
  shareReplay,
  startWith,
  debounceTime,
  switchMap,
} from "rxjs/operators";
import {generateUUIDv4} from "../util-browser";

/** The server has not yet responded to a task */
export interface ServerTaskStatePending {
  type: "pending";
  message?: string;
}

/** The task was executed on the server successfully */
export interface ServerTaskStateSuccess {
  type: "success";
  message?: string;
}

/** A  task has failed, contains a message what went wrong */
export interface ServerTaskStateFailure {
  type: "failure";
  message: string;
}

/** All possible state a task may have. */
export type ServerTaskState =
  | ServerTaskStateFailure
  | ServerTaskStatePending
  | ServerTaskStateSuccess;

/** Keys for all possible states */
export type ServerTaskStateType = ServerTaskState["type"];

/** Any operation that takes place on the server. */
export interface ServerTask {
  readonly id: string;
  readonly createdAt: number;
  readonly state$: Observable<ServerTaskState>;
  readonly description: string;
}

/**
 * A server side operation that is explicitly managed by calling
 * `succeeded` and `failed`.
 */
export class ServerTaskManual implements ServerTask {

  private _state$ = new BehaviorSubject<ServerTaskState>({type: "pending"});

  readonly state$ = this._state$.asObservable().pipe(shareReplay(1));

  readonly createdAt: number;

  readonly id: string;

  constructor(readonly description: string) {
    this.id = generateUUIDv4();
    this.createdAt = Date.now();
  }

  get state() {
    return this._state$.value;
  }

  public succeeded() {
    this._state$.next({type: "success"});
    this._state$.complete();
  }

  public failed(message: string) {
    this._state$.next({type: "failure", message});
    this._state$.complete();
  }
}

/**
 * The internal representation of a task.
 * TODO: Timestamp? ID?
 */
type InternalServerTask = {
  orig: ServerTask;
  state: ServerTaskState;
};

/**
 * Public representation of a task.
 */
type PublicServerTask = {
  description: string;
  message?: string;
}

/**
 * Public representation of a task this pending.
 */
export type PendingServerTask = {
  // TODO? startedAt: timeStamp (number)
} & PublicServerTask;

/**
 * Public representation of a task that has succeeded
 */
export type SucceededServerTask = {
  // TODO? startedAt: timeStamp (number)
  // TODO? durationInMs: number
} & PublicServerTask;

/**
 * Public representation of a task that has failed
 */
export type FailedServerTask = {
  // TODO? startedAt: timeStamp (number)
  // TODO?     durationInMs: number
} & PublicServerTask;

@Injectable()
export class ServerTasksService {

  private readonly _newTaskEvent$ = new Subject<ServerTaskManual>();

  private readonly _internalTasks$: Observable<ServerTaskManual[]> = this._newTaskEvent$.pipe(
    scan((acc, cur) => [...acc, cur].slice(-10), []),
    startWith([]),
    debounceTime(0),
    shareReplay(1),
    tap((t) => t.forEach((task, i) => console.log("[" + i + "]: " + task.description + " is now a BufferedTask")))
  );

  readonly pendingTasks$: Observable<PendingServerTask[]> = this.getTasks("pending", (t) => (
    {description: t.description,}
  ));

  readonly succeededTasks$: Observable<SucceededServerTask[]> = this.getTasks("success", (t) => (
    {description: t.description,}
  ));

  readonly failedTasks$: Observable<FailedServerTask[]> = this.getTasks("failure", (t) => (
    {description: t.description, message: t.state.message}
  ));

  // TODO: hasAnyFinishedTask$, hasAnyErrorTask$
  readonly hasAnyFinishedTask$ = of(false);

  readonly hasAnyErrorTask$ = of(false);

  constructor() {
    // Explicitly subscribe to the observable to make it hot
    this.pendingTasks$.subscribe((cache) =>
      console.log("Cached state:", cache)
    );
  }

  private getTasks(state: ServerTaskStateType, cmap: Function): Observable<PublicServerTask[]> | Observable<[]> {
    console.log("I Just subscribed to " + state);
    return this._internalTasks$.pipe(
      tap(tasks => console.log("getTasks: " + tasks.length)),
      // https://stackoverflow.com/questions/41723541/rxjs-switchmap-not-emitting-value-if-the-input-observable-is-empty-array
      switchMap(tasks =>  // switchMap to cancel last subscription on new tasks
        // combine all task state observables, inner map into state and task
        // https://stackoverflow.com/questions/56593091/use-combinelatest-with-an-array-of-observables
      {
        console.log("inside switchMap -> tasks: " + tasks.length);
        if (tasks.length > 0) {
          return combineLatest(tasks.map(t => {
            console.log("inside combineLast -> task: " + t.description);
            return t.state$.pipe(map(ts => {
              console.log("deep inside combineLast -> task: " + t.description + " taskstate: " + ts.type);
              return [ts, t]
            }))
          })).pipe(
            // filter on task state and map into task / use map function
            map(taskStates => taskStates
              .filter(([ts, t]) =>
                ts instanceof ServerTaskManual ? ts.state.type == state : ts.type === state
              )
              .map(([ts, t]) => cmap(t)))
          )
        } else {
          console.log("in else!");
          return of(tasks);
        }
      }),
      tap(x => console.log("getTasks completed!"))
    )
  }

  addTask(task: ServerTaskManual) {
    this._newTaskEvent$.next(task);
    console.log("Added task", task);
  }
}
