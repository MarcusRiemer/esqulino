import { Injectable } from "@angular/core";

import { Observable, BehaviorSubject, combineLatest } from "rxjs";
import { map, last } from "rxjs/operators";
import { CachedRequest } from "./request-cache";

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
  readonly state$: Observable<ServerTaskState>;
  readonly description: string;
}

interface ServerTaskInfo {
  readonly id: number;
  readonly createdAt: number;
}

/**
 * Public representation of a task this pending.
 */
export type PendingServerTask = {
  type: ServerTaskStateType;
  description: string;
  startedAt: number;
};

/**
 * Public representation of a task that has succeeded
 */
export type SucceededServerTask = {
  type: ServerTaskStateType;
  description: string;
  startedAt: number;
  durationInMs: number;
};

/**
 * Public representation of a task that has failed
 */
export type FailedServerTask = {
  type: ServerTaskStateType;
  description: string;
  message: string;
  startedAt: number;
  durationInMs: number;
};

/**
 * Public representation of a task.
 */
export type PublicServerTask =
  | PendingServerTask
  | SucceededServerTask
  | FailedServerTask;

type InternalTask = [ServerTask, ServerTaskState, ServerTaskInfo];

@Injectable()
export class ServerTasksService {
  private readonly _internalTasks$ = new BehaviorSubject<InternalTask[]>([]);

  private _idCounter = 0;

  private readonly _annotatedPublicTasks: Observable<
    [PublicServerTask, ServerTaskState][]
  > = this._internalTasks$.pipe(
    map((tasks) =>
      tasks.map(([t, s, c]) => {
        const convert = () => {
          switch (s.type) {
            case "pending":
              return {
                description: t.description,
                startedAt: c.createdAt,
                type: s.type,
              };
            case "success":
              return {
                description: t.description,
                durationInMs: Date.now() - c.createdAt,
                startedAt: c.createdAt,
                type: s.type,
              };
            case "failure":
              return {
                description: t.description,
                message: s.message,
                durationInMs: Date.now() - c.createdAt,
                startedAt: c.createdAt,
                type: s.type,
              };
          }
        };
        return [convert(), s];
      })
    )
  );

  readonly publicTasks$: Observable<
    PublicServerTask[]
  > = this._annotatedPublicTasks.pipe(map((all) => all.map(([t, _]) => t)));

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

  readonly succeededTasks$: Observable<
    SucceededServerTask[]
  > = this._annotatedPublicTasks.pipe(
    map(
      (all) =>
        all.filter(([_, s]) => s.type === "success") as [
          SucceededServerTask,
          ServerTaskState
        ][]
    ),
    map((all) => all.map(([t]) => t))
  );

  readonly hasNoTasks$: Observable<boolean> = this.publicTasks$.pipe(
    map((t) => t.length == 0)
  );

  readonly hasAnyFinishedTask$: Observable<boolean> = combineLatest(
    this.succeededTasks$,
    this.failedTasks$
  ).pipe(map(([s, f], i) => s.length > 0 || f.length > 0));

  readonly hasAnySucceededTask$ = this.succeededTasks$.pipe(
    map((s) => s.length > 0)
  );

  readonly hasAnyErrorTask$ = this.failedTasks$.pipe(map((f) => f.length > 0));

  addTask(task: ServerTask) {
    const info: ServerTaskInfo = {
      id: this._idCounter++,
      createdAt: Date.now(),
    };
    const initialState: ServerTaskStatePending = { type: "pending" };
    const toEnqueue: InternalTask = [task, initialState, info];
    this._internalTasks$.next([...this._internalTasks$.value, toEnqueue]);
    task.state$.pipe(last()).subscribe((newState) => {
      const idx = this._internalTasks$.value.findIndex(
        ([, , c]) => c.id === info.id
      );
      this._internalTasks$.value[idx] = [task, newState, info];
      this._internalTasks$.next(this._internalTasks$.value);
    });
  }

  createRequest<T>(obs: Observable<T>, description: string) {
    const cachedRequest = new CachedRequest<T>(obs);
    this.addTask({
      state$: cachedRequest.state$,
      description: description,
    });
  }
}
