import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AssignmentOverviewComponent } from "./overview-assignment.component";

describe("AssignmentOverviewComponent", () => {
  let component: AssignmentOverviewComponent;
  let fixture: ComponentFixture<AssignmentOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignmentOverviewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
