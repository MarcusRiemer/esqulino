import { TestBed } from "@angular/core/testing";
import {ServerTaskManual, ServerTasksService, ServerTaskState} from "./server-tasks.service";
import { first } from "rxjs/operators";
import { Observable, BehaviorSubject } from "rxjs";
import {generateUUIDv4} from "../util-browser";

describe(`ServerTaskService`, () => {
  function mkTaskSuccess(description: string):ServerTaskManual {
    const task = new ServerTaskManual(description);
    task.succeeded();
    return task;
  }

  function mkTaskPending(description: string):ServerTaskManual {
    return new ServerTaskManual(description);
  }

  function mkTaskFailure(description: string, message: string):ServerTaskManual {
    const task = new ServerTaskManual(description);
    task.failed(message);
    return task;
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

  function firstPromise<T>(obs: Observable<T>) {
    return obs.pipe(first()).toPromise();
  }

  describe("Task Lists", () => {
    it("No task enqueued", async () => {
      const t = instantiate();

      const pendingTasks = await firstPromise(t.service.pendingTasks$);

      expect(pendingTasks).toEqual([]);
    });

    it("Single pending task enqueued (subscribe late)", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));

      const pendingTasks = await firstPromise(t.service.pendingTasks$);

      expect(pendingTasks.map((t) => t.description)).toEqual(["t1"]);
    });

    it("Single pending task enqueued (subscribe early)", async () => {
      const t = instantiate();

      const p = firstPromise(t.service.pendingTasks$);
      t.service.addTask(mkTaskPending("t1"));
      const pendingTasks = await p;

      expect(pendingTasks.map((t) => t.description)).toEqual(["t1"]);
    });

    it("Single pending task later succeeds", async () => {
      const t = instantiate();

      const task = mkTaskPending("t1");
      t.service.addTask(task);

      // Pending first
      const pending = await firstPromise(t.service.pendingTasks$);
      expect(pending.map((t) => t.description)).toEqual(["t1"]);

      const succeeded = await firstPromise(t.service.succeededTasks$);
      expect(succeeded.map((t) => t.description)).toEqual([]);
      // Changed to succeed
      task.succeeded();

      // Now succeeded
      const succeededLater = await firstPromise(t.service.succeededTasks$);
      expect(succeededLater.map((t) => t.description)).toEqual(["t1"]);

      // Nothing remains pending
      const pendingLater = await firstPromise(t.service.pendingTasks$);
      expect(pendingLater.map((t) => t.description)).toEqual([]);
    });

    it("Two pending tasks enqueued (subscribe late)", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));

      console.log("Awaiting values");

      const pendingTasks = await firstPromise(t.service.pendingTasks$);

      expect(pendingTasks.map((t) => t.description)).toEqual(["t1", "t2"]);
    });

    it("Two pending tasks enqueued (subscribe early)", async () => {
      const t = instantiate();

      const p = firstPromise(t.service.pendingTasks$);
      console.log("Subscribed values");

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));

      console.log("Awaiting values");

      const pendingTasks = await p;

      expect(pendingTasks.map((t) => t.description)).toEqual(["t1", "t2"]);
    });

    it("Two pending tasks, first later succeeds", async () => {
      const t = instantiate();

      const task1 = mkTaskPending("t1");
      t.service.addTask(task1);
      t.service.addTask(mkTaskPending("t2"));

      // Pending first
      const pending = await firstPromise(t.service.pendingTasks$);
      expect(pending.map((t) => t.description)).toEqual(["t1", "t2"]);

      // Changed to succeed
      task1.succeeded();

      // Now succeeded
      const succeeded = await firstPromise(t.service.succeededTasks$);
      expect(succeeded.map((t) => t.description)).toEqual(["t1"]);

      // Other remains pending
      const pendingLater = await firstPromise(t.service.pendingTasks$);
      expect(pendingLater.map((t) => t.description)).toEqual(["t2"]);
    });

    it("Three pending tasks enqueued (subscribe late)", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));
      t.service.addTask(mkTaskPending("t3"));

      const pendingTasks = await firstPromise(t.service.pendingTasks$);

      expect(pendingTasks.map((t) => t.description)).toEqual([
        "t1",
        "t2",
        "t3",
      ]);
    });

    it("Three pending tasks enqueued (subscribe early)", async () => {
      const t = instantiate();

      const p = firstPromise(t.service.pendingTasks$);

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));
      t.service.addTask(mkTaskPending("t3"));

      const pending = await p;

      expect(pending.map((t) => t.description)).toEqual(["t1", "t2", "t3"]);
    });

    it("Three pending tasks enqueued (subscribe early & later again)", async () => {
      const t = instantiate();

      const p = firstPromise(t.service.pendingTasks$);

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));
      t.service.addTask(mkTaskPending("t3"));

      const pending = await p;
      expect(pending.map((t) => t.description)).toEqual(["t1", "t2", "t3"]);

      const again = await firstPromise(t.service.pendingTasks$);
      expect(again.map((t) => t.description)).toEqual(["t1", "t2", "t3"]);
    });

    it("Three pending tasks enqueued (subscribe late & later again)", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));
      t.service.addTask(mkTaskPending("t3"));

      const pending = await firstPromise(t.service.pendingTasks$);
      expect(pending.map((t) => t.description)).toEqual(["t1", "t2", "t3"]);

      const again = await firstPromise(t.service.pendingTasks$);
      expect(again.map((t) => t.description)).toEqual(["t1", "t2", "t3"]);
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
