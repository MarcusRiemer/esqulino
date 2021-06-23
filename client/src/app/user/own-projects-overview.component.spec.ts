import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MatDialogModule } from "@angular/material/dialog";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { InMemoryCache } from "@apollo/client/core";

import {
  ApolloTestingModule,
  APOLLO_TESTING_CACHE,
} from "apollo-angular/testing";
import { ServerApiService, ServerDataService } from "../shared";
import { UserService } from "../shared/auth/user.service";

import { OwnProjectsOverviewComponent } from "./own-projects-overview.component";

describe("OwnProjectsOverviewComponent", () => {
  let component: OwnProjectsOverviewComponent;
  let fixture: ComponentFixture<OwnProjectsOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OwnProjectsOverviewComponent],
      imports: [
        ApolloTestingModule,
        HttpClientTestingModule,
        MatSnackBarModule,
        MatDialogModule,
      ],
      providers: [
        UserService,
        ServerDataService,
        ServerApiService,
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
