import { LOCALE_ID } from "@angular/core";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { MatSnackBarModule } from "@angular/material/snack-bar";

import { provideGrammarList, buildGrammar } from "../../editor/spec-util";

import {
  ListGrammarDataService,
  ServerApiService,
  MutateGrammarService,
  ServerTasksService,
} from "../../shared/serverdata";
import { GrammarDescription } from "../../shared";

import { GrammarSelectComponent } from "./grammar-select.component";

describe("GrammarSelect", () => {
  async function createComponent(
    grammars: GrammarDescription[] = [],
    preSelectedId = undefined
  ) {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FormsModule, MatSnackBarModule],
      providers: [
        { provide: LOCALE_ID, useValue: "en" },
        MutateGrammarService,
        ListGrammarDataService,
        ServerTasksService,
        ServerApiService,
      ],
      declarations: [GrammarSelectComponent],
    }).compileComponents();

    let fixture = TestBed.createComponent(GrammarSelectComponent);
    let component = fixture.componentInstance;
    const httpTesting = TestBed.inject(HttpTestingController);
    const serverApi = TestBed.inject(ServerApiService);
    const grammarList = TestBed.inject(ListGrammarDataService);

    if (preSelectedId) {
      component.selectedId = preSelectedId;
    }

    // Trigger retrieval of grammars
    fixture.detectChanges();

    if (grammars) {
      provideGrammarList(grammars);
      // Trigger propagation of grammars
      fixture.detectChanges();
    }

    await fixture.whenRenderingDone();

    return {
      fixture,
      component,
      httpTesting,
      serverApi,
      grammarList,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it(`can be instantiated`, async () => {
    const dut = await createComponent();
    expect(dut.component).toBeDefined();

    expect(dut.component.selectedId).toBeUndefined();
  });

  it(`Displays all available grammars`, async () => {
    const [g1, g2] = [
      buildGrammar({ name: "g1" }),
      buildGrammar({ name: "g2" }),
    ];
    const dut = await createComponent([g1, g2]);

    const select = dut.element.querySelector("select");
    const options = Array.from(select.options).slice(1);
    expect(options.map((o) => o.text)).toEqual([g1.name, g2.name]);
  });

  it(`Pre-select a grammar`, async () => {
    const [g1, g2] = [
      buildGrammar({ name: "g1" }),
      buildGrammar({ name: "g2" }),
    ];
    const dut = await createComponent([g1, g2], g2.id);

    expect(dut.component.selectedId).toEqual(g2.id);
  });

  it(`Data Change: Selection stable with new data`, async () => {
    const [g1, g2, g3] = [
      buildGrammar({ name: "g1" }),
      buildGrammar({ name: "g2" }),
      buildGrammar({ name: "g3" }),
    ];
    const dut = await createComponent([g1, g2], g2.id);

    const selectedIndex = dut.element.querySelector("select").selectedIndex;
    expect(dut.component.selectedId).toEqual(g2.id);

    const select = dut.element.querySelector("select");
    const options = Array.from(select.options).slice(1);
    expect(options.map((o) => o.text)).toEqual([g1.name, g2.name]);

    dut.grammarList.listCache.refresh();
    provideGrammarList([g1, g2, g3]);
    dut.fixture.detectChanges();
    await dut.fixture.whenRenderingDone();

    expect(dut.component.selectedId).toEqual(g2.id);
    expect(dut.element.querySelector("select").selectedIndex).toEqual(
      selectedIndex
    );
  });

  it(`Data change: Updates selection to a different grammar`, async () => {
    const [g1, g2] = [
      buildGrammar({ name: "g1" }),
      buildGrammar({ name: "g2" }),
    ];
    const dut = await createComponent([g1, g2]);
    expect(dut.element.querySelector("select").value).toContain("undefined");

    dut.component.selectedId = g1.id;
    dut.fixture.detectChanges();
    await dut.fixture.whenRenderingDone();

    expect(dut.element.querySelector("select").value).toContain(g1.id);
  });

  it(`Click: Updates selection to a different grammar`, async () => {
    const [g1, g2] = [
      buildGrammar({ name: "g1" }),
      buildGrammar({ name: "g2" }),
    ];
    const dut = await createComponent([g1, g2]);

    const select = dut.element.querySelector("select");
    const options = Array.from(select.options);
    select.value = options[2].value; // 1 element of because of empty entry
    select.dispatchEvent(new Event("change"));
    dut.fixture.detectChanges();

    expect(dut.component.selectedId).toEqual(g2.id);
  });

  it(`Click: Allows de-selection of grammar`, async () => {
    const [g1, g2] = [
      buildGrammar({ name: "g1" }),
      buildGrammar({ name: "g2" }),
    ];
    const dut = await createComponent([g1, g2]);

    const select = dut.element.querySelector("select");
    const options = Array.from(select.options);
    select.value = options[0].value;
    select.dispatchEvent(new Event("change"));
    dut.fixture.detectChanges();

    expect(dut.component.selectedId).toBeUndefined();
  });
});