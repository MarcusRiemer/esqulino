import { Injectable } from "@angular/core";

import { Observable, BehaviorSubject, Subject, combineLatest, of } from "rxjs";
import { map, flatMap, first, shareReplay } from "rxjs/operators";

export interface ServerTaskStateSuccess {
  type: "success";
}

export interface ServerTaskStatePending {
  type: "pending";
}

export interface ServerTaskStateFailure {
  type: "failure";
  message: string;
}

export type ServerTaskState =
  | ServerTaskStateFailure
  | ServerTaskStatePending
  | ServerTaskStateSuccess;

export interface ServerTask {
  readonly state$: Observable<ServerTaskState>;

  readonly description: string;
}

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
  private readonly _taskChangedEvent = new Subject<void>();

  readonly allTasks$ = new BehaviorSubject<ServerTask[]>([]);

  private readonly _internalTasks$ = combineLatest(
    this._taskChangedEvent,
    this.allTasks$
  ).pipe(
    map(([_, tasks]) => tasks),
    flatMap(
      async (tasks): Promise<InternalServerTask[]> => {
        const promises = tasks.map((t) => t.state$.pipe(first()).toPromise());
        const resolved = await Promise.all(promises);

        return tasks.map((t, i) => ({
          orig: t,
          state: resolved[i],
        }));
      }
    ),
    shareReplay(1)
  );

  readonly pendingTasks$: Observable<
    PendingServerTask[]
  > = this._internalTasks$.pipe(
    map((tasks) =>
      tasks
        .filter((t) => t.state.type === "pending")
        .map((t) => ({ description: t.orig.description }))
    )
  );

  readonly failedTasks$: Observable<FailedServerTask[]> = undefined;

  // TODO: hasAnyFinishedTask$, hasAnyErrorTask$
  readonly hasAnyFinishedTask$ = of(false);

  readonly hasAnyErrorTask$ = of(false);

  addTask(task: ServerTask) {
    this.allTasks$.next(this.allTasks$.value.concat(task));

    // Inform when task is not pending anymore
    // TODO: How to unsubscribe
    task.state$.subscribe((state) => {
      if (state.type !== "pending") {
        this._taskChangedEvent.next();
      }
    });
  }
}
