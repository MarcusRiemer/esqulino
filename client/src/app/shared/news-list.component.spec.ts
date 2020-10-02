import { LOCALE_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { NewsListComponent } from "./news-list.component";

import {
  ApolloTestingModule,
  ApolloTestingController,
} from "apollo-angular/testing";
import { FrontpageListNewsDocument } from "../../generated/graphql";
import {
  buildEmptyNewsResponse,
  buildSingleNewsResponse,
  NewsGQLResponse,
} from "../editor/spec-util/news.gql.data.spec";

describe(`Component: NewsList`, () => {
  async function createComponent(localeId: string) {
    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [{ provide: LOCALE_ID, useValue: localeId }],
      declarations: [NewsListComponent],
    }).compileComponents();

    let fixture = TestBed.createComponent(NewsListComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenRenderingDone();

    const controller = TestBed.inject(ApolloTestingController);
    const op = controller.expectOne(FrontpageListNewsDocument);

    fixture.detectChanges();
    await fixture.whenRenderingDone();

    return {
      fixture,
      component,
      controller,
      op,
      element: fixture.nativeElement as HTMLElement,
    };
  }

  it(`Works with no news present at all`, async () => {
    const c = await createComponent("de");
    c.op.flush(buildEmptyNewsResponse());

    expect(Array.from(c.element.querySelectorAll("mat-card"))).toEqual([]);
  });

  it(`Works with a single news`, async () => {
    const c = await createComponent("de");
    const news: NewsGQLResponse = buildSingleNewsResponse();
    c.op.flush(news);

    await c.fixture.whenStable();
    c.fixture.detectChanges();

    expect(Array.from(c.element.querySelectorAll("mat-card")).length).toEqual(
      1
    );
    expect(c.element.querySelector("mat-card-title").textContent).toEqual(
      news.data.frontpageListNews.nodes[0].title["de"]
    );
    expect(c.element.querySelector("mat-card-content").textContent).toEqual(
      news.data.frontpageListNews.nodes[0].text["de"]
    );
  });
});
