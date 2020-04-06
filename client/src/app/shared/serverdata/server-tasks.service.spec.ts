import { TestBed } from "@angular/core/testing";
import { ServerTasksService, ServerTask } from "./server-tasks.service";
import { first } from "rxjs/operators";
import { of } from "rxjs";

describe(`ServerTaskService`, () => {
  function mkTaskSuccess(description: string): ServerTask {
    return {
      description,
      state$: of({ type: "success" }),
    };
  }

  function mkTaskPending(description: string): ServerTask {
    return {
      description,
      state$: of({ type: "pending" }),
    };
  }

  function mkTaskFailure(description: string, message: string): ServerTask {
    return {
      description,
      state$: of({ type: "failure", message }),
    };
  }

  function instantiate() {
    TestBed.configureTestingModule({
      imports: [],
      providers: [ServerTasksService],
      declarations: [],
    });

    return {
      service: TestBed.inject(ServerTasksService),
    };
  }

  it("No task enqueued", async () => {
    const t = instantiate();
    const hasAnyFinishedTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyFinishedTask).toEqual(false);

    const hasAnyErrorTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyErrorTask).toEqual(false);

    const pendingTasks = await t.service.pendingTasks$
      .pipe(first())
      .toPromise();

    expect(pendingTasks).toEqual([]);
  });

  it("Single pending task enqueued (subscribe late)", async () => {
    const t = instantiate();

    t.service.addTask(mkTaskPending("t1"));

    const hasAnyFinishedTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyFinishedTask).toEqual(false);

    const hasAnyErrorTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyErrorTask).toEqual(false);

    const pendingTasks = await t.service.pendingTasks$
      .pipe(first())
      .toPromise();

    expect(pendingTasks.length).toEqual(1);
  });

  it("Single pending task enqueued (subscribe early)", async () => {
    const t = instantiate();

    const p = t.service.pendingTasks$.pipe(first()).toPromise();

    t.service.addTask(mkTaskPending("t1"));

    const hasAnyFinishedTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyFinishedTask).toEqual(false);

    const hasAnyErrorTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyErrorTask).toEqual(false);

    const pendingTasks = await p;

    expect(pendingTasks.length).toEqual(1);
  });

  xit("Single failed task enqueued", async () => {
    const t = instantiate();

    t.service.addTask(mkTaskFailure("t1", "e1"));

    const hasAnyFinishedTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyFinishedTask).toEqual(true);

    const hasAnyErrorTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyErrorTask).toEqual(true);
  });

  xit("Single succeeded task enqueued", async () => {
    const t = instantiate();

    t.service.addTask(mkTaskSuccess("t1"));

    const hasAnyFinishedTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyFinishedTask).withContext("hasAnyFinishedTask").toEqual(true);

    const hasAnyErrorTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyErrorTask).withContext("hasAnyErrorTask").toEqual(true);
  });
});
