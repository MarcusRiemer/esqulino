import { of } from "rxjs";
import { first } from "rxjs/operators";

import { TableDescription, Table } from "../../schema";

import { SidebarBlockDescription } from "../block.description";

import { DatabaseSchemaSidebar } from "./database-schema-sidebar";

describe(`DatabaseSchemaSidebarService`, () => {
  async function expectBlocks(
    t: TableDescription[],
    exp: SidebarBlockDescription[]
  ) {
    const obsTables = of(t.map((t) => new Table(t)));
    const sidebar = new DatabaseSchemaSidebar(obsTables);

    const blocks = await sidebar.currentBlocks.pipe(first()).toPromise();
    expect(blocks).toEqual(
      jasmine.objectContaining({
        blocks: exp,
      })
    );
  }

  it(`No Tables`, async () => {
    await expectBlocks([], []);
  });

  it(`Single table, single column`, async () => {
    await expectBlocks(
      [
        {
          name: "t",
          columns: [
            { name: "c1", index: 0, notNull: true, primary: true, type: "int" },
          ],
          foreignKeys: [],
          systemTable: false,
        },
      ],
      [
        {
          displayName: "t",
          defaultNode: {
            language: "sql",
            name: "tableIntroduction",
            properties: {
              name: "t",
            },
          },
        },
        {
          displayName: "c1",
          defaultNode: {
            language: "sql",
            name: "columnName",
            properties: {
              refTableName: "t",
              columnName: "c1",
            },
          },
        },
      ]
    );
  });

  it(`Single table, single column with table prefix`, async () => {
    await expectBlocks(
      [
        {
          name: "geschichte",
          columns: [
            {
              name: "geschichte_id",
              index: 0,
              notNull: true,
              primary: true,
              type: "int",
            },
          ],
          foreignKeys: [],
          systemTable: false,
        },
      ],
      [
        {
          displayName: "geschichte",
          defaultNode: {
            language: "sql",
            name: "tableIntroduction",
            properties: {
              name: "geschichte",
            },
          },
        },
        {
          displayName: "id",
          defaultNode: {
            language: "sql",
            name: "columnName",
            properties: {
              refTableName: "geschichte",
              columnName: "geschichte_id",
            },
          },
        },
      ]
    );
  });

  it(`Two table, multiple columns`, async () => {
    await expectBlocks(
      [
        {
          name: "t1",
          columns: [
            { name: "c1", index: 0, notNull: true, primary: true, type: "int" },
            { name: "c2", index: 0, notNull: true, primary: true, type: "int" },
          ],
          foreignKeys: [],
          systemTable: false,
        },
        {
          name: "t2",
          columns: [
            { name: "c1", index: 0, notNull: true, primary: true, type: "int" },
          ],
          foreignKeys: [],
          systemTable: false,
        },
      ],
      [
        {
          displayName: "t1",
          defaultNode: {
            language: "sql",
            name: "tableIntroduction",
            properties: {
              name: "t1",
            },
          },
        },
        {
          displayName: "c1",
          defaultNode: {
            language: "sql",
            name: "columnName",
            properties: {
              refTableName: "t1",
              columnName: "c1",
            },
          },
        },
        {
          displayName: "c2",
          defaultNode: {
            language: "sql",
            name: "columnName",
            properties: {
              refTableName: "t1",
              columnName: "c2",
            },
          },
        },
        {
          displayName: "t2",
          defaultNode: {
            language: "sql",
            name: "tableIntroduction",
            properties: {
              name: "t2",
            },
          },
        },
        {
          displayName: "c1",
          defaultNode: {
            language: "sql",
            name: "columnName",
            properties: {
              refTableName: "t2",
              columnName: "c1",
            },
          },
        },
      ]
    );
  });
});
