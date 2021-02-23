import { TestBed } from "@angular/core/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

import {
  ApolloTestingModule,
  ApolloTestingController,
} from "apollo-angular/testing";

import { MayPerformService } from "./may-perform.service";
import { MayPerformDocument, MayPerformGQL } from "src/generated/graphql";
import { first } from "rxjs/operators";
import { specExpectMayPerform } from "./may-perform.spec-util";

describe(`MayPerform`, () => {
  function instantiate() {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ApolloTestingModule],
      providers: [MayPerformGQL, MayPerformService],
    });

    return {
      mayPerform: TestBed.inject(MayPerformService),
      testingController: TestBed.inject(ApolloTestingController),
    };
  }

  it(`can be instantiated`, () => {
    expect(instantiate().mayPerform).not.toBeUndefined();
  });

  it(`Permission without resource ID grantend`, async () => {
    const s = instantiate();
    const res$ = s.mayPerform
      .mayPerform$({
        policyAction: "show",
        resourceType: "Duck",
      })
      .pipe(first())
      .toPromise();

    specExpectMayPerform(
      {
        input: {
          policyAction: "show",
          resourceType: "Duck",
        },
      },
      true
    );

    const res = await res$;

    expect(res).toEqual({ perform: true });
  });

  it(`Permission with resource ID denied`, async () => {
    const s = instantiate();
    const res$ = s.mayPerform
      .mayPerform$({
        policyAction: "show",
        resourceType: "Duck",
        resourceId: "12",
      })
      .pipe(first())
      .toPromise();

    specExpectMayPerform(
      {
        input: {
          policyAction: "show",
          resourceType: "Duck",
          resourceId: "12",
        },
      },
      false
    );

    const res = await res$;

    expect(res).toEqual({ perform: false });
  });
});
