import { TestBed } from "@angular/core/testing";
import { ServerTasksService, ServerTaskState } from "./server-tasks.service";
import { first } from "rxjs/operators";
import { of } from "rxjs";

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

  it("is completely empty", async () => {
    const t = instantiate();
    const hasAnyFinishedTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyFinishedTask).toEqual(false);

    const hasAnyErrorTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyErrorTask).toEqual(false);
  });

  it("Single failed task enqueued", async () => {
    const t = instantiate();

    t.service.addTask({
      description: "foo",
      state: ServerTaskState.FAILURE,
      state$: of(ServerTaskState.FAILURE),
    });

    const hasAnyFinishedTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyFinishedTask).toEqual(true);

    const hasAnyErrorTask = await t.service.hasAnyFinishedTask$
      .pipe(first())
      .toPromise();

    expect(hasAnyErrorTask).toEqual(true);
  });

  it("Single succeeded task enqueued", async () => {
    const t = instantiate();

    t.service.addTask({
      description: "foo",
      state: ServerTaskState.SUCCESS,
      state$: of(ServerTaskState.SUCCESS),
    });

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
