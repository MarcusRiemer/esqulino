import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { RouterTestingModule } from "@angular/router/testing";

import { ServerApiService } from "../shared";
import {
  ListGrammarDataService,
  MutateGrammarService,
} from "../shared/serverdata";
import { LinkGrammarComponent } from "./link-grammar.component";
import { generateUUIDv4 } from "../shared/util-browser";
import { buildGrammar, provideGrammarList } from "../editor/spec-util";

describe("LinkGrammarComponent", () => {
  async function createComponent(grammarId: string = undefined) {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MatSnackBarModule,
        RouterTestingModule,
      ],
      providers: [
        ServerApiService,
        ListGrammarDataService,
        MutateGrammarService,
      ],
      declarations: [LinkGrammarComponent],
    }).compileComponents();

    let fixture = TestBed.createComponent(LinkGrammarComponent);
    let component = fixture.componentInstance;
    component.grammarId = grammarId;

    fixture.detectChanges();
    await fixture.whenRenderingDone();

    const httpTesting = TestBed.inject(HttpTestingController);
    const serverApi = TestBed.inject(ServerApiService);

    return {
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
      httpTesting,
      serverApi,
    };
  }

  it(`Can be instantiated`, async () => {
    const t = await createComponent();

    expect(t.component).toBeDefined();
  });

  it(`Renders ID if no other data is available`, async () => {
    const id = generateUUIDv4();
    const t = await createComponent(id);

    expect(t.element.innerText.trim()).toEqual(id);
    expect(t.element.querySelector("a").href).toContain(id);
  });

  it(`Renders the name once the data is available`, async () => {
    const g = buildGrammar({ name: "spec g" });
    const t = await createComponent(g.id);

    provideGrammarList([g]);

    t.fixture.detectChanges();
    await t.fixture.whenRenderingDone();

    expect(t.element.innerText.trim()).toEqual(g.name);
    expect(t.element.querySelector("a").href).toContain(g.id);
  });
});
