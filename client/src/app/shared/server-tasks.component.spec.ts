import { LOCALE_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";

import { ServerDataService, ServerApiService } from "./serverdata";
import {
  ServerTasksService,
  ServerTaskState,
} from "./serverdata/server-tasks.service";

import { ServerTaskOverlayService } from "./server-tasks-overlay.service";
import { ToolbarService } from "./toolbar.service";
import { ServerTasksComponent } from "./server-tasks.component";
import { Overlay } from "@angular/cdk/overlay";
import { BehaviorSubject } from "rxjs";
import { ServerTasksOverlayComponent } from "./server-tasks-overlay.component";

describe(`Component: Server-tasks`, () => {
  async function createComponent() {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ServerDataService,
        ServerApiService,
        ServerTasksService,
        ServerTaskOverlayService,
        ToolbarService,
        Overlay,
      ],
      declarations: [ServerTasksComponent, ServerTasksOverlayComponent],
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

  it(`Displays a pending task`, async () => {
    const t = await createComponent();

    const task = {
      description: "t1",
      state$: new BehaviorSubject<ServerTaskState>({ type: "pending" }),
    };

    t.serverTaskService.addTask(task);

    t.component.showTasks(new MouseEvent("t1", { clientX: 5, clientY: 5 }));
    // TODO: Complete test
  });
});
