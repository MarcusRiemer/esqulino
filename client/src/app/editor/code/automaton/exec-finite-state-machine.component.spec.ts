import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ApolloTestingModule } from "apollo-angular/testing";
import { LanguageService } from "../../../shared";
import { ResourceReferencesService } from "../../../shared/resource-references.service";
import { CurrentCodeResourceService } from "../../current-coderesource.service";
import { ProjectService } from "../../project.service";

import { ExecFiniteStateMachineComponent } from "./exec-finite-state-machine.component";

describe("ExecFiniteStateMachineComponent", () => {
  let component: ExecFiniteStateMachineComponent;
  let fixture: ComponentFixture<ExecFiniteStateMachineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      declarations: [ExecFiniteStateMachineComponent],
      providers: [
        CurrentCodeResourceService,
        ProjectService,
        ResourceReferencesService,
        LanguageService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecFiniteStateMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
