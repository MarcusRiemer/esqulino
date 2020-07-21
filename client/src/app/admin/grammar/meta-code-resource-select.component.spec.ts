import { TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";

import { MetaCodeResourceSelectComponent } from "./meta-code-resource-select.component";

import { ServerApiService } from "../../shared";
import { MetaCodeResourceListDescription } from "./meta-code-resource.description";
import { ServerTasksService } from "../../shared/serverdata/server-tasks.service";
import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";
import { AdminMetaCodeResourcesDocument } from "../../../generated/graphql";

describe("MetaCodeResourceSelect", () => {
  async function createComponent(preSelectedId = undefined) {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule, FormsModule],
      providers: [ServerApiService, ServerTasksService],
      declarations: [MetaCodeResourceSelectComponent],
    }).compileComponents();

    let fixture = TestBed.createComponent(MetaCodeResourceSelectComponent);
    let component = fixture.componentInstance;

    if (preSelectedId) {
      component.selectedCodeResourceId = preSelectedId;
    }

    fixture.detectChanges();

    const controller = TestBed.inject(ApolloTestingController);

    return {
      fixture,
      component,
      controller,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it(`can be instantiated`, async () => {
    const fixture = await createComponent();
    expect(fixture.component).toBeDefined();
  });

  it(`Shows an empty list`, async () => {
    const fixture = await createComponent();

    const op = fixture.controller.expectOne(AdminMetaCodeResourcesDocument);
    op.flush({ data: { codeResources: { nodes: [] } } });

    fixture.fixture.detectChanges();
    await fixture.fixture.whenRenderingDone();

    const selectElement = fixture.element.querySelector("select");
    expect(selectElement.value).toBeFalsy();
    expect(selectElement.children.length).toEqual(1);
  });
  it(`Shows a list with a single unselected item`, async () => {
    const fixture = await createComponent();

    const response: MetaCodeResourceListDescription[] = [
      {
        id: "0",
        name: "zero",
      },
    ];

    const op = fixture.controller.expectOne(AdminMetaCodeResourcesDocument);
    op.flush({ data: { codeResources: { nodes: response } } });

    fixture.fixture.detectChanges();
    await fixture.fixture.whenRenderingDone();

    const selectElement = fixture.element.querySelector("select");
    expect(selectElement.selectedIndex).toEqual(-1);
    expect(selectElement.children.length).toEqual(2);
    expect(selectElement.children[1].textContent.trim()).toEqual(
      response[0].name
    );
  });

  it(`Pre-selects in a list with a single item`, async () => {
    const response: MetaCodeResourceListDescription[] = [
      {
        id: "0000",
        name: "zero",
      },
    ];

    const fixture = await createComponent(response[0].id);
    expect(fixture.component.selectedCodeResourceId).toEqual(response[0].id);

    const op = fixture.controller.expectOne(AdminMetaCodeResourcesDocument);
    op.flush({ data: { codeResources: { nodes: response } } });

    fixture.fixture.detectChanges();
    await fixture.fixture.whenRenderingDone();

    const selectElement = fixture.element.querySelector("select");

    expect(selectElement.selectedIndex).toEqual(1);
    expect(selectElement.children.length).toEqual(2);
    expect(selectElement.children[1].textContent.trim()).toEqual(
      response[0].name
    );
  });
});
