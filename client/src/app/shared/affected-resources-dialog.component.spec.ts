import { TestBed } from "@angular/core/testing";
import { MatDialogModule, MAT_DIALOG_DATA } from "@angular/material/dialog";

import {
  AffectedResourcesDialogComponent,
  AffectedResourcesDialogData,
} from "./affected-resources-dialog.component";

describe("AffectedResourcesDialogComponent", () => {
  async function mkInstance(data: AffectedResourcesDialogData) {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [AffectedResourcesDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: data,
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AffectedResourcesDialogComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
  }

  beforeEach(async () => {});

  beforeEach(() => {});

  it("should create", async () => {
    const dut = await mkInstance({
      affected: [],
      header: "",
    });
    expect(dut.component).toBeTruthy();
  });
});
