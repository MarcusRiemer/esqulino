import { Injectable } from "@angular/core";

import { Observable, BehaviorSubject, Subject, of } from "rxjs";
import {
  map,
  flatMap,
  first,
  filter,
  scan,
  tap,
  shareReplay,
  startWith,
  debounceTime,
} from "rxjs/operators";

/** The server has not yet responded to a task */
export interface ServerTaskStatePending {
  type: "pending";
}

/** The task was executed on the server successfully */
export interface ServerTaskStateSuccess {
  type: "success";
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
  readonly state$: Observable<ServerTaskState>;

  readonly description: string;
}

/**
 * A server side operation that is explicitly managed by calling
 * `succeeded` and `failed`.
 */
export class ServerTaskManual implements ServerTask {
  constructor(public readonly description: string) {}

  private _state$ = new BehaviorSubject<ServerTaskState>({ type: "pending" });

  readonly state$ = this._state$.asObservable();
  get state() {
    return this._state$.value;
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

/**
 * The internal representation of a task.
 * TODO: Timestamp? ID?
 */
type InternalServerTask = {
  orig: ServerTask;
  state: ServerTaskState;
};

/**
 * Public representation of a task this pending.
 */
export type PendingServerTask = {
  description: string;
  // TODO? startedAt: timeStamp (number)
};

/**
 * Public representation of a task that has succeeded
 */
export type SucceededServerTask = {
  description: string;
  // TODO? startedAt: timeStamp (number)
  // TODO? durationInMs: number
};

/**
 * Public representation of a task that has failed
 */
export type FailedServerTask = {
  description: string;
  // TODO? startedAt: timeStamp (number)
  // TODO? durationInMs: number
  message: string;
};

@Injectable()
export class ServerTasksService {
  private readonly _newTaskEvent$ = new Subject<ServerTask>();

  private readonly _internalTasks$ = this._newTaskEvent$.pipe(
    tap((internal) => console.log("Before internal conversion: ", internal)),
    flatMap(
      async (t): Promise<InternalServerTask> => {
        const promise = t.state$.pipe(first()).toPromise();
        const resolved = await promise;

        return {
          orig: t,
          state: resolved,
        };
      }
    ),
    tap((internal) => console.log("Converted to internal: ", internal))
  );

  readonly pendingTasks$: Observable<
    PendingServerTask[]
  > = this._internalTasks$.pipe(
    filter((t) => t.state.type === "pending"),
    map((t) => ({ description: t.orig.description })),
    // Taken from: https://stackoverflow.com/questions/50452856/rxjs-buffer-observable-with-max-and-min-
    scan((acc, cur) => [...acc, cur].slice(-10), []),
    startWith([]),
    debounceTime(0),
    shareReplay(1)
  );

  // TODO: Get rid of redundancy
  readonly succeededTasks$: Observable<
    PendingServerTask[]
  > = this._internalTasks$.pipe(
    filter((t) => t.state.type === "success"),
    map((t) => ({ description: t.orig.description })),
    // Taken from: https://stackoverflow.com/questions/50452856/rxjs-buffer-observable-with-max-and-min-
    scan((acc, cur) => [...acc, cur].slice(-10), []),
    startWith([]),
    debounceTime(0),
    shareReplay(1)
  );

  readonly failedTasks$: Observable<FailedServerTask[]> = undefined;

  // TODO: hasAnyFinishedTask$, hasAnyErrorTask$
  readonly hasAnyFinishedTask$ = of(false);

  readonly hasAnyErrorTask$ = of(false);

  constructor() {
    // Explicitly subscribe to the observable to make it hot
    this.pendingTasks$.subscribe((cache) =>
      console.log("Cached state:", cache)
    );
  }

  addTask(task: ServerTask) {
    this._newTaskEvent$.next(task);
    console.log("Added task", task);
  }
}
