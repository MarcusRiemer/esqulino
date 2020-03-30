import { FormsModule } from "@angular/forms";
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";

import { MultiLingualInputComponent } from "./multilingual-input.component";
import { LOCALE_ID, SimpleChange } from "@angular/core";
import { MultilingualString } from "./multilingual-string.description";
import { MultiLingualEditorComponent } from "./multilingual-editor.component";

describe("Component: MultiLingualEditor", () => {
  async function createComponent(localeId: string) {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]), // Required to inject `Location`
        FormsModule,
      ],
      providers: [{ provide: LOCALE_ID, useValue: localeId }],
      declarations: [MultiLingualInputComponent, MultiLingualEditorComponent],
    }).compileComponents();

    let fixture = TestBed.createComponent(MultiLingualEditorComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();

    return {
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it("testing the input control", async () => {
    let c = await createComponent("de");

    const mulString: MultilingualString = {};

    c.component.original = mulString;
    c.component.translated = mulString;
    c.component.control = "input";

    c.fixture.detectChanges();

    expect(c.component).toBeTruthy();
    expect(c.element.querySelectorAll("multilingual-input").length).toEqual(2);
  });

  it("testing the textarea control", async () => {
    let c = await createComponent("de");

    const mulString: MultilingualString = {};

    c.component.original = mulString;
    c.component.translated = mulString;
    c.component.control = "textarea";

    c.fixture.detectChanges();

    expect(c.component).toBeTruthy();
    expect(c.element.querySelectorAll("input").length).toEqual(0);
  });

  it("testing the output of the inputs", async () => {
    let c = await createComponent("de");

    let newString: MultilingualString;
    const mulString: MultilingualString = {};
    const changed = { original: { de: "Test" }, translated: { en: "Test" } };

    c.component.original = mulString;
    c.component.translated = mulString;
    c.component.control = "textarea";
    c.component.placeholder = "Informationen";

    c.fixture.detectChanges();
    expect(c.component).toBeTruthy();
    //

    c.component.translatedChange.subscribe(
      (value: MultilingualString) => (newString = value)
    );

    c.component.original = changed.original;
    c.component.translated = changed.translated;

    c.component.ngOnChanges({
      original: new SimpleChange(c.component.original, changed.original, false),
      translated: new SimpleChange(
        c.component.translated,
        changed.translated,
        false
      ),
    });

    expect(newString["en"]).toEqual("Test");
  });
});
