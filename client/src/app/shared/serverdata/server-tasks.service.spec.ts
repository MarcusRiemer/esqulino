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

  fdescribe("Task Lists", () => {
    it("No task enqueued", async () => {
      const t = instantiate();

      const pendingTasks = await t.service.pendingTasks$
        .pipe(first())
        .toPromise();

      expect(pendingTasks).toEqual([]);
    });

    it("Single pending task enqueued (subscribe late)", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));

      const pendingTasks = await t.service.pendingTasks$
        .pipe(first())
        .toPromise();

      expect(pendingTasks.map((t) => t.description)).toEqual(["t1"]);
    });

    it("Single pending task enqueued (subscribe early)", async () => {
      const t = instantiate();

      const p = t.service.pendingTasks$.pipe(first()).toPromise();
      t.service.addTask(mkTaskPending("t1"));
      const pendingTasks = await p;

      expect(pendingTasks.map((t) => t.description)).toEqual(["t1"]);
    });

    it("Two pending tasks enqueued (subscribe late)", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));

      console.log("Awaiting values");

      const pendingTasks = await t.service.pendingTasks$
        .pipe(first())
        .toPromise();

      expect(pendingTasks.map((t) => t.description)).toEqual(["t1", "t2"]);
    });

    it("Two pending tasks enqueued (subscribe early)", async () => {
      const t = instantiate();

      const p = t.service.pendingTasks$.pipe(first()).toPromise();
      console.log("Subscribed values");

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));

      console.log("Awaiting values");

      const pendingTasks = await p;

      expect(pendingTasks.map((t) => t.description)).toEqual(["t1", "t2"]);
    });

    it("Three pending tasks enqueued (subscribe late)", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));
      t.service.addTask(mkTaskPending("t3"));

      console.log("Awaiting values");

      const pendingTasks = await t.service.pendingTasks$
        .pipe(first())
        .toPromise();

      expect(pendingTasks.map((t) => t.description)).toEqual([
        "t1",
        "t2",
        "t3",
      ]);
    });

    it("Three pending tasks enqueued (subscribe early)", async () => {
      const t = instantiate();

      const p = t.service.pendingTasks$.pipe(first()).toPromise();
      console.log("Subscribed values");

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));
      t.service.addTask(mkTaskPending("t3"));

      console.log("Awaiting values");

      const pendingTasks = await p;

      expect(pendingTasks.map((t) => t.description)).toEqual([
        "t1",
        "t2",
        "t3",
      ]);
    });

    it("Three pending tasks enqueued (subscribe early & later again)", async () => {
      const t = instantiate();

      const p = t.service.pendingTasks$.pipe(first()).toPromise();
      console.log("Subscribed values");

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));
      t.service.addTask(mkTaskPending("t3"));

      console.log("Awaiting values");

      const pendingTasks = await p;

      expect(pendingTasks.map((t) => t.description)).toEqual([
        "t1",
        "t2",
        "t3",
      ]);

      const tasksAgain = await t.service.pendingTasks$
        .pipe(first())
        .toPromise();

      expect(tasksAgain.map((t) => t.description)).toEqual(["t1", "t2", "t3"]);
    });
  });

  describe("Properties", () => {
    it("No task enqueued", async () => {
      const t = instantiate();
      const hasAnyFinishedTask = await t.service.hasAnyFinishedTask$
        .pipe(first())
        .toPromise();

      expect(hasAnyFinishedTask).toEqual(false);

      const hasAnyErrorTask = await t.service.hasAnyErrorTask$
        .pipe(first())
        .toPromise();

      expect(hasAnyErrorTask).toEqual(false);
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
    });
  });
});
