import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { TestBed } from "@angular/core/testing";
import { LOCALE_ID } from "@angular/core";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";

import { CreateProjectComponent } from "./create-project.component";

import { JavascriptRequiredComponent } from "../shared/javascript-required.component";
import { EmptyComponent } from "../shared/empty.component";

import {
  ApolloTestingModule,
  ApolloTestingController,
} from "apollo-angular/testing";
import {
  CreateProjectDocument,
  CreateProjectMutation,
  FullProjectQuery,
} from "../../generated/graphql";
import { ApolloQueryResult } from "@apollo/client/core";

describe("CreateProjectComponent", () => {
  async function createComponent(localeId: string = "de") {
    await TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        RouterTestingModule.withRoutes([
          { path: "editor/:id", component: EmptyComponent },
        ]),
        FormsModule,
        MatCardModule,
      ],
      providers: [{ provide: LOCALE_ID, useValue: localeId }],
      declarations: [
        CreateProjectComponent,
        JavascriptRequiredComponent,
        EmptyComponent,
      ],
    }).compileComponents();

    let fixture = TestBed.createComponent(CreateProjectComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();

    const controller = TestBed.inject(ApolloTestingController);

    return {
      fixture,
      component,
      controller,
      element: fixture.nativeElement as HTMLElement,
      localeId,
    };
  }

  it(`Can be instantiated`, async () => {
    const c = await createComponent();
    expect(c.component.currentError).toEqual([]);
    expect(c.component.inProgress.getValue()).toBe(false);
    expect(c.component.params).not.toBeUndefined();
    expect(c.element.querySelectorAll("input").length).toEqual(2);
  });

  it(`Creates a project with valid name and slug`, async () => {
    const c = await createComponent();

    c.component.params.name = { de: "Name des Projekts" };
    c.component.params.slug = "name-des-projekts";
    const expProgess: boolean[] = [false, true, false];
    c.component.inProgress.subscribe((prog) => {
      expect(prog).toEqual(expProgess.pop());
    });

    const request = c.component.createProject();

    const serverResponse: CreateProjectMutation = {
      __typename: "Mutation",
      createProject: {
        __typename: "CreateProjectPayload",
        id: "bdcb9a69-cadc-4ffb-9c95-077e81fc7aae",
        errors: [],
      },
    };

    c.controller
      .expectOne(CreateProjectDocument)
      .flush({ data: serverResponse });

    const result = await request;

    expect(result).toEqual(serverResponse.createProject);

    const router = TestBed.inject(Router);
    expect(router.url).toEqual("/editor/" + result.id);
  });

  it(`Displays errors`, async () => {
    const c = await createComponent();

    const expProgess: boolean[] = [false, true, false];
    c.component.inProgress.subscribe((prog) => {
      expect(prog).toEqual(expProgess.pop());
    });
    const request = c.component.createProject();

    const serverResponse = {
      data: {
        createProject: {
          id: null,
          errors: ["name may not be empty", "slug may not be empty"],
        },
      },
    };

    const op = c.controller.expectOne(CreateProjectDocument);
    op.flush(serverResponse);

    await request;

    expect(c.component.currentError).toEqual(
      serverResponse.data.createProject.errors
    );
  });
  it(`Allows only a single request`, async () => {
    const c = await createComponent();
    const expProgess: boolean[] = [false, true, false];

    c.component.inProgress.subscribe((prog) => {
      expect(prog).toEqual(expProgess.pop());
    });

    c.component.createProject();
    c.fixture.detectChanges();

    expect(c.element.querySelector("button").disabled).toEqual(true);

    try {
      await c.component.createProject();
      fail("Second project creation must fail");
    } catch (e) {
      expect(e).toMatch(/progress/);
    }
  });
});
