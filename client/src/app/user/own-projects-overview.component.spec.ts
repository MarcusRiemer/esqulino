import { ComponentFixture, TestBed } from "@angular/core/testing";
import { InMemoryCache } from "@apollo/client";

import {
  ApolloTestingModule,
  APOLLO_TESTING_CACHE,
} from "apollo-angular/testing";

import { OwnProjectsOverviewComponent } from "./own-projects-overview.component";

describe("OwnProjectsOverviewComponent", () => {
  let component: OwnProjectsOverviewComponent;
  let fixture: ComponentFixture<OwnProjectsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OwnProjectsOverviewComponent],
      imports: [ApolloTestingModule],
      providers: [
        {
          provide: APOLLO_TESTING_CACHE,
          useValue: new InMemoryCache({ addTypename: true }),
        },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnProjectsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
