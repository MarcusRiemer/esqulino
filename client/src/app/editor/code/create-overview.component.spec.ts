import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOverviewComponent } from './create-overview.component';

describe('CreateOverviewComponent', () => {
  let component: CreateOverviewComponent;
  let fixture: ComponentFixture<CreateOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateOverviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
