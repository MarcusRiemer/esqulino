import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';

import { ProgrammingLanguageSelectComponent } from "./programming-language-select.component";
import { AvailableLanguages } from '../../shared';

describe('ProgrammingLanguageSelect', () => {
  async function createComponent(preSelectedId = undefined) {
    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
      ],
      providers: [
      ],
      declarations: [
        ProgrammingLanguageSelectComponent
      ]
    })
      .compileComponents();

    let fixture = TestBed.createComponent(ProgrammingLanguageSelectComponent);
    let component = fixture.componentInstance;

    if (preSelectedId) {
      component.selectedId = preSelectedId;
    }

    fixture.detectChanges();

    return ({
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
    });
  }

  it(`can be instantiated`, async () => {
    const fixture = await createComponent();
    expect(fixture.component).toBeDefined();
  });

  it(`has entries for each programming language`, async () => {
    const count = Object.values(AvailableLanguages).length;

    const fixture = await createComponent();
    await fixture.fixture.whenRenderingDone();

    expect(fixture.element.querySelectorAll("option").length).toEqual(count);
  });
});