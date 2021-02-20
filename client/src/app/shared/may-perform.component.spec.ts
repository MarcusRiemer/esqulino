import { TestBed } from "@angular/core/testing";
import {
  ApolloTestingController,
  ApolloTestingModule,
} from "apollo-angular/testing";

import { MayPerformService } from "./auth/may-perform.service";
import { MayPerformComponent } from "./may-perform.component";
import { MayPerformRequestDescription } from "./may-perform.description";

describe(`MayPerformComponent`, () => {
  async function createComponent(req: MayPerformRequestDescription) {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [MayPerformService],
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

  it(`Makes a request`, async () => {
    const t = await createComponent({
      policyAction: "show",
      resourceType: "Duck",
    });
  });
});
