import { blocklyToInternal } from "./sync-ast";

describe(`Blockly AST syncing`, () => {
  describe(`blocklyToInternal`, () => {
    it(`Empty workspace`, () => {
      const res = blocklyToInternal(
        `<xml xmlns="https://developers.google.com/blockly/xml"></xml>`
      );
      expect(res).toBeUndefined();
    });

    it(`Single Block without properties`, () => {
      const res = blocklyToInternal(`
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="sql.select" id=";k2,$mQK|U/8##JZ8Rku"></block>
        </xml>
      `);
      expect(res).toEqual({
        language: "sql",
        name: "select",
      });
    });

    it(`Single Block with properties`, () => {
      const res = blocklyToInternal(`
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="sql.tableIntroduction" id="^$SsG1#{HIZ)*WQ;nMaR">
            <field name="name">person</field>
          </block>
        </xml>
      `);
      expect(res).toEqual({
        language: "sql",
        name: "tableIntroduction",
        properties: {
          name: "person",
        },
      });
    });

    it(`Block with single value child :: SQL DISTINCT`, () => {
      const res = blocklyToInternal(`
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="sql.select" id="nMuuh~x1lg^Xglx-{95P">
            <value name="distinct">
              <block type="sql.distinct" id="0,?Ss~9Jy8H=EJ+h7U/."></block>
            </value>
          </block>
        </xml>
      `);
      expect(res).toEqual({
        language: "sql",
        name: "select",
        children: {
          distinct: [{ language: "sql", name: "distinct" }],
        },
      });
    });

    it(`Block with multiple value children in the same group :: SQL person.id, person.name`, () => {
      const res = blocklyToInternal(`
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="sql.select" id="nMuuh~x1lg^Xglx-{95P">
            <value name="columns">
              <block type="sql.columnName" id="1rJnP5$A.9=jEw5_}vZJ">
                <field name="refTableName">person</field>
                <field name="columnName">id</field>
                <value name="__list__">
                  <block type="sql.columnName" id="MhrF#8=}O:;PV0-yq_JP">
                    <field name="refTableName">person</field>
                    <field name="columnName">name</field>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </xml>
      `);
      expect(res).toEqual({
        language: "sql",
        name: "select",
        children: {
          columns: [
            {
              language: "sql",
              name: "columnName",
              properties: {
                refTableName: "person",
                columnName: "id",
              },
            },
            {
              language: "sql",
              name: "columnName",
              properties: {
                refTableName: "person",
                columnName: "name",
              },
            },
          ],
        },
      });
    });

    it(`Block with multiple value children in different groups :: SQL DISTINCT person.id, person.name`, () => {
      const res = blocklyToInternal(`
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="sql.select" id="nMuuh~x1lg^Xglx-{95P">
            <value name="distinct">
              <block type="sql.distinct" id="0,?Ss~9Jy8H=EJ+h7U/."></block>
            </value>
            <value name="columns">
              <block type="sql.columnName" id="1rJnP5$A.9=jEw5_}vZJ">
                <field name="refTableName">person</field>
                <field name="columnName">id</field>
                <value name="__list__">
                  <block type="sql.columnName" id="MhrF#8=}O:;PV0-yq_JP">
                    <field name="refTableName">person</field>
                    <field name="columnName">name</field>
                  </block>
                </value>
              </block>
            </value>
          </block>
        </xml>
      `);
      expect(res).toEqual({
        language: "sql",
        name: "select",
        children: {
          distinct: [{ language: "sql", name: "distinct" }],
          columns: [
            {
              language: "sql",
              name: "columnName",
              properties: {
                refTableName: "person",
                columnName: "id",
              },
            },
            {
              language: "sql",
              name: "columnName",
              properties: {
                refTableName: "person",
                columnName: "name",
              },
            },
          ],
        },
      });
    });

    it(`Statement list`, () => {
      const res = blocklyToInternal(`
        <xml xmlns="https://developers.google.com/blockly/xml">
          <block type="sql.from" id="q$f8BBt]/.h8)E=s2KWw" x="335" y="174">
            <statement name="joins">
              <block type="sql.crossJoin" id="Otd)FmcsBf4egEn*Pe5#">
                <value name="table">
                  <block type="sql.tableIntroduction" id="pg7~Dktq/OX8cU1CcX{_">
                    <field name="name">a</field>
                  </block>
                </value>
                <next>
                  <block type="sql.crossJoin" id="Ld%#cKCtx[k6?8%ojMyP">
                    <value name="table">
                      <block
                        type="sql.tableIntroduction"
                        id="%H2eP=j@ACnuSoC'NMA."
                      >
                        <field name="name">b</field>
                      </block>
                    </value>
                    <next>
                      <block type="sql.crossJoin" id="Pc.6(a}V]4?JQL+GF*z#">
                        <value name="table">
                          <block
                            type="sql.tableIntroduction"
                            id="^$SsG1#{HIZ)*WQ;nMaR"
                          >
                            <field name="name">c</field>
                          </block>
                        </value>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </statement>
          </block>
        </xml>
`);
      debugger;
      expect(res).toEqual({
        language: "sql",
        name: "from",
        children: {
          joins: [
            {
              language: "sql",
              name: "crossJoin",
              children: {
                table: [
                  {
                    language: "sql",
                    name: "tableIntroduction",
                    properties: { name: "a" },
                  },
                ],
              },
            },
            {
              language: "sql",
              name: "crossJoin",
              children: {
                table: [
                  {
                    language: "sql",
                    name: "tableIntroduction",
                    properties: { name: "b" },
                  },
                ],
              },
            },
            {
              language: "sql",
              name: "crossJoin",
              children: {
                table: [
                  {
                    language: "sql",
                    name: "tableIntroduction",
                    properties: { name: "c" },
                  },
                ],
              },
            },
          ],
        },
      });
    });
  });
});
