import { TestBed } from "@angular/core/testing";
import { ApolloTestingModule } from "apollo-angular/testing";
import { first, last, skip } from "rxjs/operators";
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

    component.ngOnChanges({
      payload: {
        firstChange: true,
        currentValue: req,
        previousValue: undefined,
        isFirstChange: () => true,
      },
    });
    fixture.detectChanges();
    await fixture.whenRenderingDone();

    return {
      fixture,
      component,
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
    await t.fixture.whenRenderingDone();

    expect(
      await t.component.showContent$.pipe(skip(1), first()).toPromise()
    ).toEqual(true);
  });

  it(`Not shown when negative`, async () => {
    const t = await createComponent({
      policyAction: "show",
      resourceType: "Duck",
    });

    specExpectMayPerform("first", false);
    await t.fixture.whenRenderingDone();

    expect(
      await t.component.showContent$.pipe(skip(1), first()).toPromise()
    ).toEqual(false);
  });

  it(`Shown when requested negative`, async () => {
    const t = await createComponent({
      policyAction: "show",
      resourceType: "Duck",
    });

    t.component.showOnForbidden = true;

    specExpectMayPerform("first", false);
    await t.fixture.whenRenderingDone();

    expect(
      await t.component.showContent$.pipe(skip(1), first()).toPromise()
    ).toEqual(true);
  });

  it(`Not shown when requested negative but got positive`, async () => {
    const t = await createComponent({
      policyAction: "show",
      resourceType: "Duck",
    });

    t.component.showOnForbidden = true;

    specExpectMayPerform("first", true);
    await t.fixture.whenRenderingDone();

    expect(
      await t.component.showContent$.pipe(skip(1), first()).toPromise()
    ).toEqual(false);
  });
});
