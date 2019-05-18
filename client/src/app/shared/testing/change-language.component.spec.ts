import { LOCALE_ID } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing'
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatMenuModule, MatButtonModule } from '@angular/material'

import { ChangeLanguageComponent } from '../change-language.component';
import { JavascriptRequiredComponent } from '../javascript-required.component';

describe('ChangeLanguageComponent', () => {
  let component: ChangeLanguageComponent;
  let fixture: ComponentFixture<ChangeLanguageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]), // Required to inject `Location`
        MatMenuModule,
        MatButtonModule
      ],
      providers: [
        { provide: LOCALE_ID, useValue: "de" }
      ],
      declarations: [
        ChangeLanguageComponent,
        JavascriptRequiredComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
