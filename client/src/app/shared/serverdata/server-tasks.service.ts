import { Injectable } from "@angular/core";

import { Observable, BehaviorSubject, Subject, combineLatest, of } from "rxjs";
import { map } from "rxjs/operators";

export enum ServerTaskState {
  PENDING,
  SUCCESS,
  FAILURE,
}

export interface ServerTask {
  state$: Observable<ServerTaskState>;

  // TODO: This shouldn't be part of the public API
  state: ServerTaskState;

  description: string;
}

export class ServerTaskManual implements ServerTask {
  constructor(public description: string) {}

  private _state$ = new BehaviorSubject<ServerTaskState>(
    ServerTaskState.PENDING
  );

  readonly state$ = this._state$.asObservable();
  get state() {
    return this._state$.value;
  }

  public succeeded() {
    this._state$.next(ServerTaskState.SUCCESS);
    this._state$.complete();
  }

  public failed() {
    this._state$.next(ServerTaskState.FAILURE);
    this._state$.complete();
  }
}

@Injectable()
export class ServerTasksService {
  private readonly _taskChangedEvent = new Subject<void>();

  readonly allTasks$ = new BehaviorSubject<ServerTask[]>([]);

  readonly pendingTasks$ = combineLatest(
    this._taskChangedEvent,
    this.allTasks$
  ).pipe(
    map(([_, tasks]) => tasks),
    map((tasks) => tasks.filter((t) => t.state === ServerTaskState.PENDING))
  );

  // TODO: Finished Tasks

  // TODO: hasAnyFinishedTask$, hasAnyErrorTask$
  readonly hasAnyFinishedTask$ = of(false);

  readonly hasAnyErrorTask$ = of(false);

  addTask(task: ServerTask) {
    this.allTasks$.next(this.allTasks$.value.concat(task));

    // Inform about new task that was queued
    this._taskChangedEvent.next();

    // Inform when task is not pending anymore
    // TODO: How to unsubscribe
    task.state$.subscribe((state) => {
      if (state !== ServerTaskState.PENDING) {
        this._taskChangedEvent.next();
      }
    });
  }
}
