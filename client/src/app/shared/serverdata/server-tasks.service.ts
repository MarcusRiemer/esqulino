import { Injectable } from "@angular/core";

import { Observable, BehaviorSubject, Subject, of } from "rxjs";
import { map, flatMap, first, bufferCount, filter } from "rxjs/operators";

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

// The internal representation of a task
type InternalServerTask = {
  orig: ServerTask;
  state: ServerTaskState;
};

export type PendingServerTask = {
  description: string;
};

export type FailedServerTask = {
  description: string;
  message: string;
};

@Injectable()
export class ServerTasksService {
  readonly allTasks$ = new Subject<ServerTask>();

  private readonly _internalTasks$ = this.allTasks$.pipe(
    flatMap(
      async (t): Promise<InternalServerTask> => {
        const promise = t.state$.pipe(first()).toPromise();
        const resolved = await promise;

        return {
          orig: t,
          state: resolved,
        };
      }
    )
  );

  readonly pendingTasks$: Observable<
    PendingServerTask[]
  > = this._internalTasks$.pipe(
    filter((t) => t.state.type === "pending"),
    map((t) => ({ description: t.orig.description })),
    bufferCount(10)
  );

  readonly failedTasks$: Observable<FailedServerTask[]> = undefined;

  // TODO: hasAnyFinishedTask$, hasAnyErrorTask$
  readonly hasAnyFinishedTask$ = of(false);

  readonly hasAnyErrorTask$ = of(false);

  addTask(task: ServerTask) {
    this.allTasks$.next(task);
  }
}
