import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { ApolloTestingModule } from "apollo-angular/testing";
import {
  CreateProgrammingLanguageGQL,
  FullGrammarGQL,
} from "../../../generated/graphql";
import { LanguageService, ServerApiService } from "../../shared";
import { EmptyComponent } from "../../shared/empty.component";
import { ResourceReferencesService } from "../../shared/resource-references.service";
import { ProjectService } from "../project.service";
import { CreateLanguageComponent } from "./create-language.component";

describe("CreateLanguageComponent", () => {
  let component: CreateLanguageComponent;
  let fixture: ComponentFixture<CreateLanguageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ApolloTestingModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: ":id", component: EmptyComponent },
        ]),
        HttpClientTestingModule,
      ],
      providers: [
        ProjectService,
        LanguageService,
        ServerApiService,
        CreateProgrammingLanguageGQL,
        ResourceReferencesService,
        FullGrammarGQL,
      ],
      declarations: [CreateLanguageComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLanguageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
