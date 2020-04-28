import { LOCALE_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { MatMenuModule } from "@angular/material/menu";
import { Overlay } from "@angular/cdk/overlay";

import { ServerDataService, ServerApiService } from "./serverdata";
import {
  ServerTasksService,
  ServerTaskState,
} from "./serverdata/server-tasks.service";
import { ToolbarService } from "./toolbar.service";
import { ServerTasksComponent } from "./server-tasks.component";

import { BehaviorSubject } from "rxjs";
import { take } from "rxjs/operators";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { By } from "@angular/platform-browser";

describe(`Component: Server-tasks`, () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MatMenuModule, NoopAnimationsModule],
      providers: [
        ServerDataService,
        ServerApiService,
        ServerTasksService,
        ToolbarService,
        Overlay,
      ],
      declarations: [ServerTasksComponent],
    }).compileComponents();

    let fixture = TestBed.createComponent(ServerTasksComponent);
    let component = fixture.componentInstance;

    fixture.detectChanges();

    const serverApi = TestBed.inject(ServerApiService);
    const httpTestingController = TestBed.inject(HttpTestingController);
    const serverTaskService = TestBed.inject(ServerTasksService);

    return {
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
      httpTestingController,
      serverTaskService,
    };
  }

  it(`can be instantiated`, async () => {
    const t = await createComponent();

    expect(t.component).toBeDefined();
  });
  it("Overlay should be not displayed", async () => {
    const t = await createComponent();
    const list = t.fixture.debugElement.queryAll(By.css("#st-card"));
    expect(list).toEqual([]);
  });
  it("Overlay should be displayed", async () => {
    const t = await createComponent();
    t.fixture.debugElement
      .query(By.css("button"))
      .triggerEventHandler("click", null);
    const list = t.fixture.debugElement.queryAll(By.css("#st-card"));
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  it(`Displays one pending tasks`, async () => {
    const t = await createComponent();
    const task = {
      description: "t1",
      state$: new BehaviorSubject<ServerTaskState>({ type: "pending" }),
    };
    const expectedOrder: string[][] = [[], ["t1"]];
    t.component.allTasks$.pipe(take(3)).subscribe((tl) => {
      const exp = expectedOrder.shift();
      expect(tl.map((t) => t.description)).toEqual(exp);
      if (tl.length > 0) {
        t.fixture.detectChanges();
        const listItems = t.fixture.debugElement.queryAll(
          By.css("#st-card li")
        );
        expect(listItems.length).toEqual(1);
      }
    });
    t.fixture.debugElement
      .query(By.css("button"))
      .triggerEventHandler("click", null);
    t.fixture.detectChanges();

    t.serverTaskService.addTask(task);
  });
  it(`Displays two pending tasks`, async () => {
    const t = await createComponent();
    const task = {
      description: "t1",
      state$: new BehaviorSubject<ServerTaskState>({ type: "pending" }),
    };
    const task2 = {
      description: "t2",
      state$: new BehaviorSubject<ServerTaskState>({ type: "pending" }),
    };
    const expectedOrder: string[][] = [[], ["t1"], ["t2", "t1"]];
    t.component.allTasks$.pipe(take(3)).subscribe((tl) => {
      const exp = expectedOrder.shift();
      expect(tl.map((t) => t.description)).toEqual(exp);
      if (tl.length > 0) {
        t.fixture.detectChanges();
        const listItems = t.fixture.debugElement.queryAll(
          By.css("#st-card li")
        );
        expect(listItems.length).toEqual(1);
      }
    });
    t.fixture.debugElement
      .query(By.css("button"))
      .triggerEventHandler("click", null);
    t.fixture.detectChanges();

    t.serverTaskService.addTask(task);
    t.serverTaskService.addTask(task2);
  });
  it(`hasNoTasks should work`, async () => {
    const t = await createComponent();
    const task = {
      description: "t1",
      state$: new BehaviorSubject<ServerTaskState>({ type: "pending" }),
    };
    const task2 = {
      description: "t2",
      state$: new BehaviorSubject<ServerTaskState>({ type: "pending" }),
    };
    const expectedOrder: string[][] = [[], ["t1"], ["t2", "t1"]];
    const expectedExist: boolean[] = [true, false, false];

    t.component.allTasks$.pipe(take(3)).subscribe((tl) => {
      const exp = expectedOrder.shift();
      expect(tl.map((t) => t.description)).toEqual(exp);
    });

    t.component
      .hasNoTasks()
      .pipe(take(3))
      .subscribe((c) => {
        const exp = expectedExist.shift();
        expect(c).toBe(exp);
      });
    t.serverTaskService.addTask(task);
    t.serverTaskService.addTask(task2);
  });
});
