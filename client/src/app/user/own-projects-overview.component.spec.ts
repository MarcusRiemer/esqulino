import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnProjectsOverviewComponent } from './own-projects-overview.component';

describe('OwnProjectsOverviewComponent', () => {
  let component: OwnProjectsOverviewComponent;
  let fixture: ComponentFixture<OwnProjectsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OwnProjectsOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnProjectsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
