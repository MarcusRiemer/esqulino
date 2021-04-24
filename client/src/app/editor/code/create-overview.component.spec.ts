import { ComponentFixture, TestBed } from "@angular/core/testing";

import { LanguageService, ServerApiService } from "../../shared";
import { ResourceReferencesService } from "../../shared/resource-references.service";
import { ProjectService } from "../project.service";

import { CreateOverviewComponent } from "./create-overview.component";

describe("CreateOverviewComponent", () => {
  let component: CreateOverviewComponent;
  let fixture: ComponentFixture<CreateOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        ProjectService,
        ResourceReferencesService,
        ServerApiService,
        LanguageService,
      ],
      declarations: [CreateOverviewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
