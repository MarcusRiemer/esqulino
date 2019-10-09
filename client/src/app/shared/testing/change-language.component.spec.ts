import { LOCALE_ID } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing'
import { TestBed } from '@angular/core/testing';

import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { ChangeLanguageComponent } from '../change-language.component';
import { JavascriptRequiredComponent } from '../javascript-required.component';

import { environment } from './../../../environments/environment';
import { NaturalLanguagesService } from 'src/app/natural-languages.service';
import { LinkService } from 'src/app/link.service';

// Directly dumping Unicode surrogates seems to be illegal in XML. This leads
// to crashes in the XML-report generation if a spec actually fails. These
// crashes can be avoided by this function, which compares a URI-encoded variation
// that may safely be XML-encoded.
// Related issue: https://github.com/karma-runner/karma-junit-reporter/issues/116
function expectUnicodeStrings(actual: string, expected: string) {
  expect(encodeURIComponent(actual)).toEqual(encodeURIComponent(expected));
}

describe('ChangeLanguageComponent', () => {
  async function createComponent(localeId: string) {
    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]), // Required to inject `Location`
        MatMenuModule,
        MatButtonModule
      ],
      providers: [
        { provide: LOCALE_ID, useValue: localeId },
        NaturalLanguagesService,
        LinkService
      ],
      declarations: [
        ChangeLanguageComponent,
        JavascriptRequiredComponent
      ]
    })
      .compileComponents();

    let fixture = TestBed.createComponent(ChangeLanguageComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();

    return ({ fixture, component, element: fixture.nativeElement as HTMLElement });
  }

  it('Should provide correct URLs from "de"', async () => {
    let t = await createComponent("de")

    // Component properties
    expect(t.component).toBeTruthy();
    expect(t.component.urlForLanguage("de")).toEqual("//" + environment.canonicalHost)
    expect(t.component.urlForLanguage("en")).toEqual("//en." + environment.canonicalHost)

    // Button should have german flag
    expectUnicodeStrings(t.element.querySelector("button").innerText, "🇩🇪");
  });

  it('Should provide correct URLs from "en"', async () => {
    let t = await createComponent("en");

    expect(t.component).toBeTruthy();
    expect(t.component.urlForLanguage("de")).toEqual("//" + environment.canonicalHost)
    expect(t.component.urlForLanguage("en")).toEqual("//en." + environment.canonicalHost)

    // Button should have english flag
    expectUnicodeStrings(t.element.querySelector("button").innerText, "🇬🇧");
  });

  it('Should provide correct URLs from "unknown"', async () => {
    let t = await createComponent("unknown");

    expect(t.component).toBeTruthy();
    expect(t.component.urlForLanguage("de")).toEqual("//" + environment.canonicalHost)
    expect(t.component.urlForLanguage("en")).toEqual("//en." + environment.canonicalHost)

    // Button should have neutral flag
    expectUnicodeStrings(t.element.querySelector("button").innerText, "🏳");
  });
});
