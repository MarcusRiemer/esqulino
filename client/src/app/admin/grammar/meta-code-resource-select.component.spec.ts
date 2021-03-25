import { LOCALE_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";

import { AdminMetaCodeResourcesDocument } from "../../../generated/graphql";

import { NaturalLanguagesService } from "../../natural-languages.service";
import { LinkService } from "../../link.service";
import { ServerApiService } from "../../shared";
import { CurrentLanguagePipe } from "../../shared/current-language.pipe";
import { MetaCodeResourceListDescription } from "./meta-code-resource.description";

import { MetaCodeResourceSelectComponent } from "./meta-code-resource-select.component";

describe("MetaCodeResourceSelect", () => {
  async function createComponent(preSelectedId = undefined) {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule, FormsModule],
      providers: [
        ServerApiService,
        { provide: LOCALE_ID, useValue: "en" },
        NaturalLanguagesService,
        LinkService,
      ],
      declarations: [MetaCodeResourceSelectComponent, CurrentLanguagePipe],
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
        project: {
          id: "76b1c8b3-7feb-4d77-96a7-a79523c2d58d",
          name: { de: "de", en: "en" },
        },
      },
    ];

    const op = fixture.controller.expectOne(AdminMetaCodeResourcesDocument);
    op.flush({ data: { codeResources: { nodes: response } } });

    await fixture.fixture.whenStable();
    fixture.fixture.detectChanges();

    const selectElement = fixture.element.querySelector("select");
    expect(selectElement.selectedIndex).toEqual(-1);
    expect(selectElement.children.length).toEqual(2);
    expect(selectElement.children[1].textContent.trim()).toEqual("en - zero");
  });

  it(`Pre-selects in a list with a single item`, async () => {
    const response: MetaCodeResourceListDescription[] = [
      {
        id: "0000",
        name: "zero",
        project: {
          id: "76b1c8b3-7feb-4d77-96a7-a79523c2d58d",
          name: { de: "de", en: "en" },
        },
      },
    ];

    const fixture = await createComponent(response[0].id);
    expect(fixture.component.selectedCodeResourceId).toEqual(response[0].id);

    const op = fixture.controller.expectOne(AdminMetaCodeResourcesDocument);
    op.flush({ data: { codeResources: { nodes: response } } });

    await fixture.fixture.whenStable();
    fixture.fixture.detectChanges();

    const selectElement = fixture.element.querySelector("select");

    expect(selectElement.selectedIndex).toEqual(1);
    expect(selectElement.children.length).toEqual(2);
    expect(selectElement.children[1].textContent.trim()).toEqual("en - zero");
  });
});
