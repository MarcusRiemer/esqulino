import { Injectable } from "@angular/core";

import { Observable, BehaviorSubject, of } from "rxjs";
import { map, shareReplay, last } from "rxjs/operators";
import { generateUUIDv4 } from "../util-browser";

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
  readonly id: string; // TODO: Internal
  readonly createdAt: number; // TODO: Internal
  readonly state$: Observable<ServerTaskState>;
  readonly description: string;
}

/**
 * A server side operation that is explicitly managed by calling
 * `succeeded` and `failed`.
 */
// TODO: Own file `server-task-manual.ts`
export class ServerTaskManual implements ServerTask {
  private _state$ = new BehaviorSubject<ServerTaskState>({ type: "pending" });

  readonly state$ = this._state$.asObservable();

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
    this._state$.next({ type: "success" });
    this._state$.complete();
  }

  public failed(message: string) {
    this._state$.next({ type: "failure", message });
    this._state$.complete();
  }
}

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
  message: string;
  // TODO? startedAt: timeStamp (number)
  // TODO? durationInMs: number
};

/**
 * Public representation of a task.
 */
type PublicServerTask =
  | PendingServerTask
  | SucceededServerTask
  | FailedServerTask;

// TODO: Use ServerTask in first field
// TODO: Add other internal fields (Object?)
type InternalTask = [ServerTaskManual, ServerTaskState];

@Injectable()
export class ServerTasksService {
  // private readonly _newTaskEvent$ = new BehaviorSubject<ServerTaskManual>([]);

  private readonly _internalTasks$ = new BehaviorSubject<InternalTask[]>([]);

  // TODO: Use this counter to give IDs to tasks
  private _idCounter = 0;

  private readonly _annotatedPublicTasks: Observable<
    [PublicServerTask, ServerTaskState][]
  > = this._internalTasks$.pipe(
    map((tasks) =>
      tasks.map(([t, s]) => {
        const convert = () => {
          switch (s.type) {
            case "pending":
            case "success":
              return { description: t.description };
            case "failure":
              return {
                description: t.description,
                message: s.message,
              };
          }
        };

        return [convert(), s];
      })
    )
  );

  // TODO: Tests
  readonly publicTasks$ = this._annotatedPublicTasks.pipe(
    map((all) => all.map(([t]) => t))
  );

  readonly pendingTasks$: Observable<
    PendingServerTask[]
  > = this._annotatedPublicTasks.pipe(
    map((all) => all.filter(([_, s]) => s.type === "pending")),
    map((all) => all.map(([t]) => t))
  );

  readonly failedTasks$: Observable<
    FailedServerTask[]
  > = this._annotatedPublicTasks.pipe(
    map(
      (all) =>
        all.filter(([_, s]) => s.type === "failure") as [
          FailedServerTask,
          ServerTaskState
        ][]
    ),
    map((all) => all.map(([t]) => t))
  );

  readonly succeededTasks$ = this.getTasks<SucceededServerTask>(
    "success",
    ([t]) => ({ description: t.description })
  );

  // TODO: hasAnyFinishedTask$, hasAnyErrorTask$
  readonly hasAnyFinishedTask$ = of(false);

  readonly hasAnyErrorTask$ = of(false);

  private getTasks<T>(
    target: ServerTaskStateType,
    cmap: (i: InternalTask) => T
  ): Observable<T[]> {
    return this._internalTasks$.pipe(
      map((l) => l.filter(([_, state]) => state.type === target)),
      map((l) => l.map(cmap))
    );
  }

  addTask(task: ServerTaskManual) {
    const initialState: ServerTaskStatePending = { type: "pending" };
    const toEnqueue: InternalTask = [task, initialState];
    this._internalTasks$.next([...this._internalTasks$.value, toEnqueue]);

    task.state$.pipe(last()).subscribe((newState) => {
      const idx = this._internalTasks$.value.findIndex(
        (v) => v[0].id === task.id
      );
      console.log(`State of ${task.id} at idx ${idx} changed to`, newState);

      this._internalTasks$.value[idx] = [task, newState];

      this._internalTasks$.next(this._internalTasks$.value);
    });

    console.log("Added task", task);
  }
}
