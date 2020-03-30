import { LOCALE_ID } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";

import { NewsListComponent } from "./news-list.component";
import { ServerDataService, ServerApiService } from "./serverdata";
import { NewsFrontpageDescription } from "./news.description";
import { generateUUIDv4 } from "./util-browser";

describe(`Component: NewsList`, () => {
  async function createComponent(
    localeId: string,
    news: NewsFrontpageDescription[]
  ) {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: LOCALE_ID, useValue: localeId },
        ServerDataService,
        ServerApiService,
      ],
      declarations: [NewsListComponent],
    }).compileComponents();

    let fixture = TestBed.createComponent(NewsListComponent);
    let component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenRenderingDone();

    const serverApi = TestBed.inject(ServerApiService);
    const httpTestingController = TestBed.inject(HttpTestingController);
    httpTestingController.expectOne(serverApi.getUserNewsListUrl()).flush(news);

    fixture.detectChanges();
    await fixture.whenRenderingDone();

    return {
      fixture,
      component,
      element: fixture.nativeElement as HTMLElement,
      news,
      httpTestingController,
    };
  }

  it(`Works with no news present at all`, async () => {
    const c = await createComponent("de", []);

    expect(Array.from(c.element.querySelectorAll("mat-card"))).toEqual([]);
  });

  it(`Works with a single news`, async () => {
    const c = await createComponent("de", [
      {
        id: generateUUIDv4(),
        publishedFrom: "December 17, 1995 03:24:00",
        text: {
          de: "Deutscher Text",
        },
        title: {
          de: "Deutscher Titel",
        },
      },
    ]);

    expect(Array.from(c.element.querySelectorAll("mat-card")).length).toEqual(
      1
    );
    expect(c.element.querySelector("mat-card-title").textContent).toEqual(
      c.news[0].title["de"]
    );
    expect(c.element.querySelector("mat-card-content").textContent).toEqual(
      c.news[0].text["de"]
    );
  });
});
