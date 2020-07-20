import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { TestBed } from "@angular/core/testing";
import { LOCALE_ID } from "@angular/core";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { MatCardModule } from "@angular/material/card";

import { CreateProjectComponent } from "./create-project.component";

import { JavascriptRequiredComponent } from "../shared/javascript-required.component";
import { ServerApiService } from "../shared";
import { EmptyComponent } from "../shared/empty.component";

describe("CreateProjectComponent", () => {
  async function createComponent(localeId: string = "de") {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: "editor/:id", component: EmptyComponent },
        ]),
        FormsModule,
        HttpClientTestingModule,
        MatCardModule,
      ],
      providers: [{ provide: LOCALE_ID, useValue: localeId }, ServerApiService],
      declarations: [
        CreateProjectComponent,
        JavascriptRequiredComponent,
        EmptyComponent,
      ],
    }).compileComponents();

    let fixture = TestBed.createComponent(CreateProjectComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();

    return {
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
      localeId,
    };
  }

  it(`Can be instantiated`, async () => {
    const c = await createComponent();

    expect(c.component.currentError).toBeUndefined();
    expect(c.component.inProgress).toBe(false);
    expect(c.component.params).not.toBeUndefined();
    expect(c.element.querySelectorAll("input").length).toEqual(2);
  });

  it(`Creates a project with valid name and slug`, async () => {
    const c = await createComponent();

    const httpTestingController = TestBed.inject(HttpTestingController);
    const serverApi = TestBed.inject(ServerApiService);

    c.component.params.name = { de: "Name des Projekts" };
    c.component.params.slug = "name-des-projekts";

    const request = c.component.createProject();

    expect(c.component.inProgress).toEqual(true);

    const serverResponse = { id: "bdcb9a69-cadc-4ffb-9c95-077e81fc7aae" };
    httpTestingController
      .expectOne(serverApi.createProjectUrl())
      .flush(serverResponse);

    const result = await request;

    expect(c.component.inProgress).toEqual(false);
    expect(result).toEqual(serverResponse);

    const router = TestBed.inject(Router);
    expect(router.url).toEqual("/editor/" + result.id);
  });

  it(`Displays errors`, async () => {
    const c = await createComponent();

    const httpTestingController = TestBed.inject(HttpTestingController);
    const serverApi = TestBed.inject(ServerApiService);

    const request = c.component.createProject();

    expect(c.component.inProgress).toEqual(true);

    const serverResponse = {
      errors: ["name may not be empty", "slug may not be empty"],
    };
    httpTestingController
      .expectOne(serverApi.createProjectUrl())
      .flush(serverResponse, { status: 400, statusText: "Invalid Request" });

    await request;

    expect(c.component.inProgress).toEqual(false);
    expect(c.component.currentError).toEqual(serverResponse);
  });

  it(`Allows only a single request`, async () => {
    const c = await createComponent();

    c.component.createProject();
    c.fixture.detectChanges();

    expect(c.component.inProgress).toEqual(true);
    expect(c.element.querySelector("button").disabled).toEqual(true);

    try {
      await c.component.createProject();
      fail("Second project creation must fail");
    } catch (e) {
      expect(e).toMatch(/progress/);
    }
  });
});
