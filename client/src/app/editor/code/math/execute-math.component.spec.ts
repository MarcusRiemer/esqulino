import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ApolloTestingModule } from "apollo-angular/testing";
import { LanguageService } from "../../../shared";
import { ResourceReferencesService } from "../../../shared/resource-references.service";
import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { ProjectService } from "../../project.service";

import { ExecuteMathComponent } from "./execute-math.component";

describe("ExecuteMathComponent", () => {
  let component: ExecuteMathComponent;
  let fixture: ComponentFixture<ExecuteMathComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      declarations: [ExecuteMathComponent],
      providers: [
        CurrentCodeResourceService,
        ProjectService,
        ResourceReferencesService,
        LanguageService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecuteMathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
