import { TestBed } from "@angular/core/testing";
import { ServerTasksService } from "./server-tasks.service";
import { first, take } from "rxjs/operators";
import { Observable } from "rxjs";
import { ServerTaskManual } from "./server-task-manual";

describe(`ServerTaskService`, () => {
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

  function mkTaskSuccess(description: string): ServerTaskManual {
    const task = new ServerTaskManual(description);
    task.succeeded();
    return task;
  }

  function mkTaskPending(description: string): ServerTaskManual {
    return new ServerTaskManual(description);
  }

  function mkTaskFailure(
    description: string,
    message: string
  ): ServerTaskManual {
    const task = new ServerTaskManual(description);
    task.failed(message);
    return task;
  }

  async function hasFinishedTask(s: ServerTasksService, toBe: boolean) {
    const hasAnyFinishedTask = await s.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();
    expect(hasAnyFinishedTask).toEqual(toBe);
  }

  async function hasErrorTask(s: ServerTasksService, toBe: boolean) {
    const hasAnyFinishedTask = await s.hasAnyErrorTask$
      .pipe(first())
      .toPromise();
    expect(hasAnyFinishedTask).toEqual(toBe);
  }

  async function hasSucceededTask(s: ServerTasksService, toBe: boolean) {
    const hasAnyFinishedTask = await s.hasAnySucceededTask$
      .pipe(first())
      .toPromise();
    expect(hasAnyFinishedTask).toEqual(toBe);
  }

  async function waitMil(mil: number) {
    const prom = new Promise<void>((resolve) => {
      setTimeout((_) => {
        resolve();
      }, mil);
    });
    return prom;
  }

  function firstPromise<T>(obs: Observable<T>) {
    return obs.pipe(first()).toPromise();
  }

  describe("Snapshots: Legacy Task Lists", () => {
    it("No task enqueued", async () => {
      const t = instantiate();

      const pendingTasks = await firstPromise(t.service.pendingTasks$);

      expect(pendingTasks).toEqual([]);
    });

    it("Single pending task enqueued", async () => {
      const t = instantiate();

      const noPendingTasks = await firstPromise(t.service.pendingTasks$);
      expect(noPendingTasks).toEqual([]);

      t.service.addTask(mkTaskPending("t1"));

      const pendingTasks = await firstPromise(t.service.pendingTasks$);
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

      // Nothing remains pending
      const pendingLater = await firstPromise(t.service.pendingTasks$);
      expect(pendingLater.map((t) => t.description)).toEqual([]);

      // Now succeeded
      const succeededLater = await firstPromise(t.service.succeededTasks$);
      expect(succeededLater.map((t) => t.description)).toEqual(["t1"]);
    });

    it("Two pending tasks enqueued", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));

      console.log("Awaiting values");

      const pendingTasks = await firstPromise(t.service.pendingTasks$);

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
  });

  describe("Snapshot: Single Task Properties", () => {
    it("No task enqueued", async () => {
      const t = instantiate();

      await hasFinishedTask(t.service, false);
      await hasErrorTask(t.service, false);
      await hasSucceededTask(t.service, false);
    });

    it("Single pending task enqueued (subscribe late)", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));

      await hasFinishedTask(t.service, false);
      await hasErrorTask(t.service, false);
      await hasSucceededTask(t.service, false);
    });
    it("Single failed task enqueued (subscribe late)", async () => {
      const t = instantiate();

      const task = mkTaskPending("t1");
      t.service.addTask(task);
      task.failed("test");

      await hasFinishedTask(t.service, true);
      await hasErrorTask(t.service, true);
      await hasSucceededTask(t.service, false);
    });
    it("Single succeeded task enqueued (subscribe late)", async () => {
      const t = instantiate();

      const task = mkTaskPending("t1");
      t.service.addTask(task);
      task.succeeded();

      await hasFinishedTask(t.service, true);
      await hasErrorTask(t.service, false);
      await hasSucceededTask(t.service, true);
    });
  });

  describe("Snapshot: Two Task Properties", () => {
    it("Two pending task enqueued (subscribe late)", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));
      t.service.addTask(mkTaskPending("t2"));

      await hasFinishedTask(t.service, false);
      await hasErrorTask(t.service, false);
      await hasSucceededTask(t.service, false);
    });
    it("Two failed task enqueued (subscribe late)", async () => {
      const t = instantiate();

      const task = mkTaskPending("t1");
      t.service.addTask(mkTaskPending("t2"));
      t.service.addTask(task);
      task.failed("test");

      await hasFinishedTask(t.service, true);
      await hasErrorTask(t.service, true);
      await hasSucceededTask(t.service, false);
    });
    it("Two succeeded task enqueued (subscribe late)", async () => {
      const t = instantiate();

      const task = mkTaskPending("t1");
      t.service.addTask(mkTaskPending("t2"));
      t.service.addTask(task);
      task.succeeded();

      await hasFinishedTask(t.service, true);
      await hasErrorTask(t.service, false);
      await hasSucceededTask(t.service, true);
    });
  });

  describe("Check emitted value Order:", () => {
    it("Single Task Pending -> Succeeded: Lists refreshed", async () => {
      const t = instantiate();

      const expectedPending: string[][] = [[], ["t1"], []];
      const expectedSucceeded: string[][] = [[], [], ["t1"]];

      t.service.pendingTasks$.pipe(take(3)).subscribe((l) => {
        const exp = expectedPending.shift();
        expect(l.map((t) => t.description))
          .withContext("during pending")
          .toEqual(exp);
      });
      t.service.succeededTasks$.pipe(take(3)).subscribe((l) => {
        const exp = expectedSucceeded.shift();
        expect(l.map((t) => t.description))
          .withContext("during succeeded")
          .toEqual(exp);
      });

      const task = mkTaskPending("t1");
      t.service.addTask(task);
      task.succeeded();

      expect(expectedPending).withContext("final pending").toEqual([]);
      expect(expectedSucceeded).withContext("final succeeded").toEqual([]);
    });

    it("Single Task Pending -> Failed: Lists refreshed", async () => {
      const t = instantiate();

      const expectedPending: string[][] = [[], ["t1"], []];
      const expectedFailed: string[][] = [[], [], ["t1"]];

      t.service.pendingTasks$.pipe(take(3)).subscribe((l) => {
        const exp = expectedPending.shift();
        expect(l.map((t) => t.description))
          .withContext("during pending")
          .toEqual(exp);
      });
      t.service.failedTasks$.pipe(take(3)).subscribe((l) => {
        const exp = expectedFailed.shift();
        expect(l.map((t) => t.description))
          .withContext("during Failed")
          .toEqual(exp);
      });

      const task = mkTaskPending("t1");
      t.service.addTask(task);
      task.failed("test");

      expect(expectedPending).withContext("final pending").toEqual([]);
      expect(expectedFailed).withContext("final succeeded").toEqual([]);
    });

    it("Two Task: One Pending -> Succeeded: Lists refreshed", async () => {
      const t = instantiate();

      const expectedPending: string[][] = [[], ["t1"], ["t1", "t2"], ["t2"]];
      const expectedSucceeded: string[][] = [[], [], [], ["t1"]];

      t.service.pendingTasks$.pipe(take(4)).subscribe((l) => {
        const exp = expectedPending.shift();
        expect(l.map((t) => t.description))
          .withContext("during pending")
          .toEqual(exp);
      });
      t.service.succeededTasks$.pipe(take(4)).subscribe((l) => {
        const exp = expectedSucceeded.shift();
        expect(l.map((t) => t.description))
          .withContext("during succeeded")
          .toEqual(exp);
      });

      const task = mkTaskPending("t1");
      t.service.addTask(task);
      t.service.addTask(mkTaskPending("t2"));
      task.succeeded();

      expect(expectedPending).withContext("final pending").toEqual([]);
      expect(expectedSucceeded).withContext("final succeeded").toEqual([]);
    });

    it("Two Tasks: One Pending -> Failed: Lists refreshed", async () => {
      const t = instantiate();

      const expectedPending: string[][] = [[], ["t1"], ["t1", "t2"], ["t2"]];
      const expectedFailed: string[][] = [[], [], [], ["t1"]];

      t.service.pendingTasks$.pipe(take(4)).subscribe((l) => {
        const exp = expectedPending.shift();
        expect(l.map((t) => t.description))
          .withContext("during pending")
          .toEqual(exp);
      });
      t.service.failedTasks$.pipe(take(4)).subscribe((l) => {
        const exp = expectedFailed.shift();
        expect(l.map((t) => t.description))
          .withContext("during Failed")
          .toEqual(exp);
      });

      const task = mkTaskPending("t1");
      t.service.addTask(task);
      t.service.addTask(mkTaskPending("t2"));
      task.failed("test");

      expect(expectedPending).withContext("final pending").toEqual([]);
      expect(expectedFailed).withContext("final succeeded").toEqual([]);
    });

    it("Three Tasks: One Pending -> Failed, One Pending -> Succeeded: Lists refreshed", async () => {
      const t = instantiate();

      const expectedPending: string[][] = [
        [],
        ["t1"],
        ["t1", "t2"],
        ["t1", "t2", "t3"],
        ["t2", "t3"],
        ["t3"],
      ];
      const expectedSucceeded: string[][] = [[], [], [], [], ["t1"], ["t1"]];
      const expectedFailed: string[][] = [[], [], [], [], [], ["t2"]];

      t.service.pendingTasks$.pipe(take(6)).subscribe((l) => {
        const exp = expectedPending.shift();
        expect(l.map((t) => t.description))
          .withContext("during pending")
          .toEqual(exp);
      });
      t.service.succeededTasks$.pipe(take(6)).subscribe((l) => {
        const exp = expectedSucceeded.shift();
        expect(l.map((t) => t.description))
          .withContext("during succeeded")
          .toEqual(exp);
      });
      t.service.failedTasks$.pipe(take(6)).subscribe((l) => {
        const exp = expectedFailed.shift();
        expect(l.map((t) => t.description))
          .withContext("during Failed")
          .toEqual(exp);
      });

      const task = mkTaskPending("t1");
      const task2 = mkTaskPending("t2");
      t.service.addTask(task);
      t.service.addTask(task2);
      t.service.addTask(mkTaskPending("t3"));
      task.succeeded();
      task2.failed("test");

      expect(expectedPending).withContext("final pending").toEqual([]);
      expect(expectedSucceeded).withContext("final pending").toEqual([]);
      expect(expectedFailed).withContext("final succeeded").toEqual([]);
    });
  });
  describe("Snapshot: Public Tasks, succeeded and failed first", () => {
    it("Single pending Task", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskPending("t1"));

      const publicTasks = await firstPromise(t.service.publicTasks$);
      expect(publicTasks.map((task) => task.description)).toEqual(["t1"]);
    });
    it("Two Tasks: pending & succeeded", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskSuccess("t1"));
      t.service.addTask(mkTaskPending("t2"));

      const publicTasks = await firstPromise(t.service.publicTasks$);
      expect(publicTasks.map((task) => task.description)).toEqual(["t1", "t2"]);
    });
    it("Two Tasks: pending & failed", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskFailure("t1", "test"));
      t.service.addTask(mkTaskPending("t2"));

      const publicTasks = await firstPromise(t.service.publicTasks$);
      expect(publicTasks.map((task) => task.description)).toEqual(["t1", "t2"]);
    });
    it("Three Tasks: pending & succeeded & failed", async () => {
      const t = instantiate();

      t.service.addTask(mkTaskSuccess("t1"));
      t.service.addTask(mkTaskFailure("t2", "test"));
      t.service.addTask(mkTaskPending("t3"));

      const publicTasks = await firstPromise(t.service.publicTasks$);
      expect(publicTasks.map((task) => task.description))
        .withContext("Three public")
        .toEqual(["t1", "t2", "t3"]);
    });
  });
  describe("Task duration", () => {
    it("Younger task first completed", async () => {
      const t = instantiate();

      const task1 = mkTaskPending("t1");
      t.service.addTask(task1);

      await waitMil(10);

      const task2 = mkTaskPending("t2");
      t.service.addTask(task2);

      task2.succeeded();
      task1.failed("test");

      const task2Completed = (await firstPromise(t.service.succeededTasks$))[0];
      const task1Completed = (await firstPromise(t.service.failedTasks$))[0];

      expect(task1Completed.durationInMs).toBeGreaterThan(
        task2Completed.durationInMs
      );
    });
  });
});
