import { TestBed } from "@angular/core/testing";
import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";
import { first } from "rxjs/operators";
import { MayPerformGQL } from "src/generated/graphql";

import { MayPerformService } from "./may-perform.service";
import { specExpectMayPerform } from "./may-perform.spec-util";
import { MayPerformComponent } from "./may-perform.component";
import { MayPerformRequestDescription } from "./may-perform.description";

describe(`MayPerformComponent`, () => {
  async function createComponent(req: MayPerformRequestDescription) {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [MayPerformService, MayPerformGQL],
      declarations: [MayPerformComponent],
    }).compileComponents();

    let fixture = TestBed.createComponent(MayPerformComponent);
    let component = fixture.componentInstance;

    component.payload = req;

    fixture.detectChanges();
    await fixture.whenRenderingDone();

    const controller = TestBed.inject(ApolloTestingController);

    return {
      fixture,
      component,
      controller,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it(`Can be instantiated`, async () => {
    const t = await createComponent(undefined);

    expect(t.component).toBeDefined();
  });

  it(`Shown when positive`, async () => {
    const t = await createComponent({
      policyAction: "show",
      resourceType: "Duck",
    });

    specExpectMayPerform("first", true);

    expect(await t.component.showContent$.pipe(first()).toPromise()).toEqual(
      true
    );
  });

  it(`Not shown when negative`, async () => {
    const t = await createComponent({
      policyAction: "show",
      resourceType: "Duck",
    });

    specExpectMayPerform("first", false);

    expect(await t.component.showContent$.pipe(first()).toPromise()).toEqual(
      false
    );
  });

  it(`Shown when requested negative`, async () => {
    const t = await createComponent({
      policyAction: "show",
      resourceType: "Duck",
    });

    t.component.showOnForbidden = true;

    specExpectMayPerform("first", false);

    expect(await t.component.showContent$.pipe(first()).toPromise()).toEqual(
      true
    );
  });

  it(`Not shown when requested negative but got positive`, async () => {
    const t = await createComponent({
      policyAction: "show",
      resourceType: "Duck",
    });

    t.component.showOnForbidden = true;

    specExpectMayPerform("first", true);

    expect(await t.component.showContent$.pipe(first()).toPromise()).toEqual(
      false
    );
  });
});
