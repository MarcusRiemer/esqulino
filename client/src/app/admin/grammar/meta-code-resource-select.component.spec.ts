import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { MetaCodeResourceSelectComponent } from "./meta-code-resource-select.component";

import { ServerApiService } from '../../shared';
import { MetaCodeResourceListDescription } from './meta-code-resource.description';

describe('MetaCodeResourceSelect', () => {
  async function createComponent(preSelectedId = undefined) {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        ServerApiService
      ],
      declarations: [
        MetaCodeResourceSelectComponent
      ]
    })
      .compileComponents();

    let fixture = TestBed.createComponent(MetaCodeResourceSelectComponent);
    let component = fixture.componentInstance;

    if (preSelectedId) {
      component.selectedCodeResourceId = preSelectedId;
    }

    fixture.detectChanges();

    return ({
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
      httpTesting: TestBed.inject(HttpTestingController),
      serverApi: TestBed.inject(ServerApiService),
    });
  }

  it(`can be instantiated`, async () => {
    const fixture = await createComponent();
    expect(fixture.component).toBeDefined();
  });

  it(`Shows an empty list`, async () => {
    const fixture = await createComponent();

    fixture.httpTesting.expectOne(fixture.serverApi.getMetaCodeResourceListUrl())
      .flush([]);

    fixture.fixture.detectChanges();
    await fixture.fixture.whenRenderingDone();

    const selectElement = fixture.element.querySelector("select");
    expect(selectElement.value).toBeFalsy();
    expect(selectElement.children.length).toEqual(1);
  });

  it(`Shows a list with a single item`, async () => {
    const fixture = await createComponent();

    const response: MetaCodeResourceListDescription[] = [
      {
        id: "0",
        name: "zero"
      }
    ];

    fixture.httpTesting.expectOne(fixture.serverApi.getMetaCodeResourceListUrl())
      .flush(response);

    fixture.fixture.detectChanges();
    await fixture.fixture.whenRenderingDone();

    const selectElement = fixture.element.querySelector("select");
    expect(selectElement.selectedIndex).toEqual(0);
    expect(selectElement.children.length).toEqual(2);
    expect(selectElement.children[1].textContent.trim()).toEqual(response[0].name);
  });

  xit(`Pre-selects in a list with a single item`, async () => {
    const response: MetaCodeResourceListDescription[] = [
      {
        id: "0000",
        name: "zero"
      }
    ];

    const fixture = await createComponent(response[0].id);

    fixture.httpTesting.expectOne(fixture.serverApi.getMetaCodeResourceListUrl())
      .flush(response);

    fixture.fixture.detectChanges();
    await fixture.fixture.whenRenderingDone();

    const selectElement = fixture.element.querySelector("select");

    expect(selectElement.value).toEqual(response[0].id)
    expect(selectElement.children.length).toEqual(2);
    expect(selectElement.children[1].textContent.trim()).toEqual(response[0].name);
  });
});