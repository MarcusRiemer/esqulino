import { ComponentFixture, TestBed } from "@angular/core/testing";
import { LanguageService } from "../../../shared";
import { ResourceReferencesService } from "../../../shared/resource-references.service";
import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { ProjectService } from "../../project.service";

import { ExecuteJavaScriptComponent } from "./execute-java-script.component";

describe("ExecuteJavaScriptComponent", () => {
  let component: ExecuteJavaScriptComponent;
  let fixture: ComponentFixture<ExecuteJavaScriptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExecuteJavaScriptComponent],
      providers: [
        CurrentCodeResourceService,
        ProjectService,
        ResourceReferencesService,
        LanguageService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecuteJavaScriptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
