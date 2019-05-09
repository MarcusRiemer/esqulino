import { FormsModule } from '@angular/forms';
import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from '@angular/router/testing';

import { MultiLingualInputComponent } from './multilingual-input.component';
import { LOCALE_ID } from '@angular/core';
import { MultilingualString } from './multilingual-string.description';

describe('Component: MultilingualInput', () => {
  async function createComponent(localeId: string) {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]), // Required to inject `Location`
        FormsModule
      ],
      providers: [
        { provide: LOCALE_ID, useValue: localeId }
      ],
      declarations: [
        MultiLingualInputComponent
      ]
    })
      .compileComponents();

    let fixture = TestBed.createComponent(MultiLingualInputComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();

    return ({ fixture, component, element: fixture.nativeElement as HTMLElement });
  }

  it('testing the input control', async () => {
    let c = await createComponent("de")

    const mulString: MultilingualString = {}

    c.component.editingString = mulString;
    c.component.control = 'input';
    c.component.language = 'de';
    c.component.placeholder = 'Titel';

    c.fixture.detectChanges();

    expect(c.component).toBeTruthy();
    expect(c.element.querySelector('button').innerText).toEqual("Titel für \"de\" hinzufügen")
  })

  it('testing the textarea control', async () => {
    let c = await createComponent("de")

    const mulString: MultilingualString = {}

    c.component.editingString = mulString;
    c.component.control = 'textarea';
    c.component.language = 'de';
    c.component.placeholder = 'Informationen';

    c.fixture.detectChanges();

    expect(c.component).toBeTruthy();
    expect(c.element.querySelector('button').innerText).toEqual("Informationen für \"de\" hinzufügen")
  })

  it('testing the textarea control without language', async () => {
    let c = await createComponent("de")

    const mulString: MultilingualString = {}

    c.component.editingString = mulString;
    c.component.control = 'textarea';
    c.component.placeholder = 'Informationen';

    c.fixture.detectChanges();

    expect(c.component).toBeTruthy();
    expect(c.element.querySelector('button').innerText).toEqual("Informationen für \"de\" hinzufügen")
  })

  it('testing the component without control', async () => {
    let c = await createComponent("de")

    const mulString: MultilingualString = { de: 'Test' }

    c.component.editingString = mulString;
    c.component.placeholder = 'Informationen';

    c.fixture.detectChanges();

    expect(c.component).toBeTruthy();
    expect(c.element.querySelector('input')).toBeTruthy()
  })


  it("creating an object", async () => {
    let c = await createComponent("de")

    c.component.placeholder = 'Informationen';

    c.fixture.detectChanges();
    expect(c.component).toBeTruthy();

    expect(c.element.querySelector('input')).not.toBeTruthy();
    c.element.querySelector('button').click();
    c.fixture.detectChanges();

    expect(c.element.querySelector('input')).toBeTruthy();
  })

  it("deleting a language", async () => {
    let c = await createComponent("de")

    const mulString: MultilingualString = { de: 'Test' }

    c.component.editingString = mulString;
    c.component.placeholder = 'Informationen';

    c.fixture.detectChanges();
    expect(c.component).toBeTruthy();

    expect(c.element.querySelector('input')).toBeTruthy();
    c.element.querySelector('button').click();
    c.fixture.detectChanges();

    expect(c.element.querySelector('input')).not.toBeTruthy();
    expect(c.component.currentString).toEqual({})
  })

})