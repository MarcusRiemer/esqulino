import { TableDescription } from "./schema.description";
import { Schema } from "./schema";

export const SPEC_TABLES: TableDescription[] = [
  {
    name: "ereignis",
    foreignKeys: [],
    systemTable: false,
    columns: [
      {
        index: 0,
        name: "ereignis_id",
        type: "INTEGER",
        notNull: true,
        primary: true,
      },
      {
        index: 1,
        name: "bezeichnung",
        type: "TEXT",
        notNull: true,
        dfltValue: null,
        primary: false,
      },
      {
        index: 2,
        name: "beginn",
        type: "INTEGER",
        notNull: true,
        dfltValue: null,
        primary: false,
      },
      {
        index: 3,
        name: "ende",
        type: "INTEGER",
        notNull: true,
        dfltValue: null,
        primary: false,
      },
    ],
  },
  {
    name: "person",
    systemTable: false,
    foreignKeys: [],
    columns: [
      {
        index: 0,
        name: "person_id",
        type: "INTEGER",
        notNull: true,
        dfltValue: null,
        primary: true,
      },
      {
        index: 1,
        name: "name",
        type: "TEXT",
        notNull: true,
        dfltValue: null,
        primary: false,
      },
      {
        index: 2,
        name: "geb_dat",
        type: "INTEGER",
        notNull: true,
        dfltValue: null,
        primary: false,
      },
    ],
  },
];

describe("Schema", () => {
  it("Accessing an existing table", () => {
    let s = new Schema(SPEC_TABLES);

    expect(s.getTable("person")).toBeTruthy();
    expect(s.getTable("ereignis")).toBeTruthy();
  });
});
