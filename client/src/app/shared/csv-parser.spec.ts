import * as c from "./csv-parser";

describe("Util: CSV Parser", () => {
  const CSV_STRING =
    "Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n" +
    "1,Mathematik,Deutsch,Englisch,Mathematik,Kunst\r\n" +
    "2,Sport,Französisch,Geschichte,Sport,Geschichte\r\n" +
    '3,Sport,"Religion (ev, kath)",Kunst,Mathe,Kunst';

  const ROWS_ONLY = [
    "Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag",
    "1,Mathematik,Deutsch,Englisch,Mathematik,Kunst",
    "2,Sport,Französisch,Geschichte,Sport,Geschichte",
    '3,Sport,"Religion (ev, kath)",Kunst,Mathe,Kunst',
  ];

  const CSV_TO_ARRAY = [
    ["Stunde", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag"],
    ["1", "Mathematik", "Deutsch", "Englisch", "Mathematik", "Kunst"],
    ["2", "Sport", "Französisch", "Geschichte", "Sport", "Geschichte"],
    ["3", "Sport", "Religion (ev, kath)", "Kunst", "Mathe", "Kunst"],
  ];

  const HEADER = [
    "Stunde",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
  ];

  const TABLE = [
    ["1", "Mathematik", "Deutsch", "Englisch", "Mathematik", "Kunst"],
    ["2", "Sport", "Französisch", "Geschichte", "Sport", "Geschichte"],
    ["3", "Sport", "Religion (ev, kath)", "Kunst", "Mathe", "Kunst"],
  ];

  const CSV_AS_JSON = {
    rows: [
      {
        Stunde: "1",
        Montag: "Mathematik",
        Dienstag: "Deutsch",
        Mittwoch: "Englisch",
        Donnerstag: "Mathematik",
        Freitag: "Kunst",
      },
      {
        Stunde: "2",
        Montag: "Sport",
        Dienstag: "Französisch",
        Mittwoch: "Geschichte",
        Donnerstag: "Sport",
        Freitag: "Geschichte",
      },
      {
        Stunde: "3",
        Montag: "Sport",
        Dienstag: "Religion (ev, kath)",
        Mittwoch: "Kunst",
        Donnerstag: "Mathe",
        Freitag: "Kunst",
      },
    ],
  };

  /* ---------- Successful Parse Tests ---------- */

  /* ----- splitStringToRows Function ----- */

  it("Split String To Rows Easy", () => {
    const row = c.splitStringToRows(
      "Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag"
    );
    expect(row).toEqual(["Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag"]);
  });

  it("Split String To Rows Medium", () => {
    const row = c.splitStringToRows(CSV_STRING);
    expect(row).toEqual(ROWS_ONLY);
  });

  it("Split String To Rows Hard", () => {
    const row = c.splitStringToRows(CSV_STRING);
    expect(row).toEqual(ROWS_ONLY);
  });

  /* ----- escapeDelimitersBetweenMarkers Function ----- */

  it("Escape Delimiters Between Markers Easy", () => {
    const row = c.escapeDelimitersBetweenMarkers(
      "Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag",
      [","],
      '"'
    );
    expect(row).toEqual("Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag");
  });

  it("Escape Delimiters Between Markers Medium", () => {
    const row = c.escapeDelimitersBetweenMarkers(
      'Stunde,"Montag,Dienstag",Mittwoch,Donnerstag,Freitag',
      [","],
      '"'
    );
    expect(row).toEqual("Stunde,Montag\\,Dienstag,Mittwoch,Donnerstag,Freitag");
  });

  it("Escape Delimiters Between Markers Hard", () => {
    const row = c.escapeDelimitersBetweenMarkers(
      'Stunde,"Montag,Dienstag"",Mittwoch,"Donnerstag,Freitag',
      [","],
      '"'
    );
    expect(row).toEqual(
      "Stunde,Montag\\,Dienstag\\,Mittwoch\\,Donnerstag,Freitag"
    );
  });

  /* ----- splitRowToCols Function ----- */

  it("Split Row To Columns Easy", () => {
    const result = c.splitRowToCols("a", [","], '"', 1);
    expect(result).toEqual({
      type: "row",
      data: ["a"],
    });
  });

  it("Split Row To Columns Medium", () => {
    const result = c.splitRowToCols(
      "Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag",
      [","],
      '"',
      6
    );
    expect(result).toEqual({
      type: "row",
      data: [
        "Stunde",
        "Montag",
        "Dienstag",
        "Mittwoch",
        "Donnerstag",
        "Freitag",
      ],
    });
  });

  it("Split Row To Columns Hard", () => {
    const row = c.splitRowToCols(
      '3,Sport,"Religion (ev, kath)",Kunst,Mathe,Kunst',
      [","],
      '"',
      6
    );
    expect(row).toEqual({
      type: "row",
      data: ["3", "Sport", "Religion (ev, kath)", "Kunst", "Mathe", "Kunst"],
    });
  });

  /* ----- convertArraysToJSON Function ----- */

  it("Convert Arrays To JSON Easy", () => {
    const data = [["1"], ["2"], ["3"]];
    const header = ["Stunde"];
    const result = {
      rows: [
        {
          Stunde: "1",
        },
        {
          Stunde: "2",
        },
        {
          Stunde: "3",
        },
      ],
    };
    const JSONData = c.convertArraysToJSON(data, header, true);
    expect(JSONData).toEqual(result);
  });

  it("Convert Arrays To JSON Medium", () => {
    const data = [
      ["1", "Mathematik", "Deutsch", "Englisch", "Mathematik", "Kunst"],
      ["2", "Sport", "Französisch", "Geschichte", "Sport", "Geschichte"],
      ["3", "Sport", "Religion (ev, kath)", "Kunst", "Mathe", "Kunst"],
    ];
    const header = [
      "Stunde",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
    ];
    const JSONData = c.convertArraysToJSON(data, header, true);
    expect(JSONData).toEqual(CSV_AS_JSON);
  });

  it("Convert Arrays To JSON Hard", () => {
    const JSONData = c.convertArraysToJSON(CSV_TO_ARRAY, [], false);
    expect(JSONData).toEqual(CSV_AS_JSON);
  });

  /* ----- convertCSVStringToArray Function ----- */

  it("Convert CSV String to Array", () => {
    const result = c.convertCSVStringToArray(CSV_STRING, [","], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: HEADER,
      table: TABLE,
    });
  });

  /* ---------- Tests with corrupted CSV files ---------- */

  /* ----- One Different Column Count ----- */

  let Table =
    "Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n" + "1,Mathematik,Kunst"; // 5 Cols // 3 Cols

  let Errors: c.ValidationError[] = [
    {
      line: 2,
      data: {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line in file",
        count: 3,
        expected: 5,
      },
    },
  ];

  it("One Different Column Count", () => {
    const result = c.convertCSVStringToArray(Table, [","], '"');
    expect(result).toEqual({
      type: "parseError",
      errors: Errors,
    });
  });

  /* ----- Multiple Different Column Counts ----- */

  Table =
    "Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n" + // 5 Cols
    "1,Mathematik,Kunst\r\n" + // 3 Cols
    "2,Sport,Geschichte,Sport,Geschichte,Sport\r\n" + // 6 Cols
    'x,"Religion (ev, kath)",x'; // 3 Cols

  Errors = [
    {
      line: 2,
      data: {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line in file",
        count: 3,
        expected: 5,
      },
    },
    {
      line: 3,
      data: {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line in file",
        count: 6,
        expected: 5,
      },
    },
    {
      line: 4,
      data: {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line in file",
        count: 3,
        expected: 5,
      },
    },
  ];

  it("Multiple Different Column Counts", () => {
    const result = c.convertCSVStringToArray(Table, [","], '"');
    expect(result).toEqual({
      type: "parseError",
      errors: Errors,
    });
  });

  /* ----- Different And Same Column Counts ----- */

  Table =
    "Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n" + // 5 Cols
    "1,Mathematik,Kunst, Sport, Englisch, Sport\r\n" + // 6 Cols
    "2,Sport,Geschichte,Sport,Geschichte\r\n" + // 5 Cols
    'x,"Religion (ev, kath)",x'; // 3 Cols

  Errors = [
    {
      line: 2,
      data: {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line in file",
        count: 6,
        expected: 5,
      },
    },
    {
      line: 4,
      data: {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line in file",
        count: 3,
        expected: 5,
      },
    },
  ];

  it("Different And Same Column Counts", () => {
    const result = c.convertCSVStringToArray(Table, [","], '"');
    expect(result).toEqual({
      type: "parseError",
      errors: Errors,
    });
  });

  /* ----- Empty Lines ----- */

  Table =
    "Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n" + // 5 Cols
    "\r\n" + // 1 Cols
    "2,Sport,Geschichte,Sport,Geschichte\r\n" + // 5 Cols
    "   "; // 1 Col

  Errors = [
    {
      line: 2,
      data: {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line in file",
        count: 1,
        expected: 5,
      },
    },
    {
      line: 4,
      data: {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line in file",
        count: 1,
        expected: 5,
      },
    },
  ];

  it("Empty Lines", () => {
    const result = c.convertCSVStringToArray(Table, [","], '"');
    expect(result).toEqual({
      type: "parseError",
      errors: Errors,
    });
  });

  /* ----- Marker Not Closed In One Line ----- */

  it("Marker Not Closed In One Line", () => {
    const line = 'Montag,"Dienstag,Mittwoch",Donnerstag,"Freitag';
    const result = c.splitRowToCols(line, [","], '"', 4);
    expect(result).toEqual({
      type: "markerNotClosed",
      information: "The selected marker was opened but not closed",
      fragment: "Freitag",
    });
  });

  /* ----- Marker Not Closed In Mutliple Lines ----- */

  it("Marker Not Closed In Mutliple Lines", () => {
    const table =
      "Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n" +
      '1,Mathematik,"Deutsch,Englisch",Mathematik,Kunst, Kunst\r\n' +
      '2,Sport,Französisch",Geschichte,Sport,Geschichte\r\n' +
      '3,S"po"rt,"Religion (ev, kath),Kunst,,Kunst';

    const errors: c.ValidationError[] = [
      {
        line: 3,
        data: {
          type: "markerNotClosed",
          information: "The selected marker was opened but not closed",
          fragment: ",Geschichte,Sport,Geschichte",
        },
      },
      {
        line: 4,
        data: {
          type: "markerNotClosed",
          information: "The selected marker was opened but not closed",
          fragment: "Religion (ev, kath),Kunst,,Kunst",
        },
      },
    ];

    const result = c.convertCSVStringToArray(table, [","], '"');
    expect(result).toEqual({
      type: "parseError",
      errors: errors,
    });
  });

  /* ----- Marker Not Closed With Escaped Markers ----- */

  it("Marker Not Closed With Escaped Markers", () => {
    const table =
      "Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n" +
      '1,Mathematik,\\"Deutsch,Englisch",Mathematik,Kunst, Kunst\r\n' +
      "2,Sport,Französisch,Geschichte,Sport,Geschichte\r\n" +
      '3,S"p\\"o"rt,"Religion (ev, kath)",\\"Kunst",,Kunst';

    const errors: c.ValidationError[] = [
      {
        line: 2,
        data: {
          type: "markerNotClosed",
          information: "The selected marker was opened but not closed",
          fragment: ",Mathematik,Kunst, Kunst",
        },
      },
      {
        line: 4,
        data: {
          type: "markerNotClosed",
          information: "The selected marker was opened but not closed",
          fragment: ",,Kunst",
        },
      },
    ];

    const result = c.convertCSVStringToArray(table, [","], '"');
    expect(result).toEqual({
      type: "parseError",
      errors: errors,
    });
  });

  /* ----- Marker Not Closed And Wrong Column Counts ----- */

  it("Marker Not Closed And Wrong Column Counts", () => {
    const table =
      "Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n" +
      '1,Mathematik,\\"Deutsch,Englisch",Mathematik,Kunst, Kunst\r\n' +
      "2,Sport,Sport,Geschichte\r\n" +
      '3,S"p\\"o"rt,"Religion (ev, kath)",\\"Kunst",,Kunst';

    const errors: c.ValidationError[] = [
      {
        line: 2,
        data: {
          type: "markerNotClosed",
          information: "The selected marker was opened but not closed",
          fragment: ",Mathematik,Kunst, Kunst",
        },
      },
      {
        line: 3,
        data: {
          type: "wrongColumnCount",
          information: "Expected column count to match with first line in file",
          count: 4,
          expected: 6,
        },
      },
      {
        line: 4,
        data: {
          type: "markerNotClosed",
          information: "The selected marker was opened but not closed",
          fragment: ",,Kunst",
        },
      },
    ];

    const result = c.convertCSVStringToArray(table, [","], '"');
    expect(result).toEqual({
      type: "parseError",
      errors: errors,
    });
  });

  /* ---------- Special Cases ---------- */

  it("No Content Before First Or After Last Marker", () => {
    const line = '"Stunde,Montag",y\r\n';
    const result = c.convertCSVStringToArray(line, [","], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: ["Stunde,Montag", "y"],
      table: [],
    });
  });

  it("Ignore Last Line if empty", () => {
    const line = "Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n";
    const result = c.convertCSVStringToArray(line, [","], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: HEADER,
      table: [],
    });
  });

  it("Write Out Not Used Delimiter And Textmarkers", () => {
    const line = 'Mo,n,tag;Di"e"ns"ta"g\r\n';
    const result = c.convertCSVStringToArray(line, [";"], "'");
    expect(result).toEqual({
      type: "parseResult",
      header: ["Mo,n,tag", 'Di"e"ns"ta"g'],
      table: [],
    });
  });

  it("Write Out Escaped Markers", () => {
    const line = '\\"Stunde,Montag\\",y\r\n';
    const result = c.convertCSVStringToArray(line, [","], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: ['"Stunde', 'Montag"', "y"],
      table: [],
    });
  });

  it("Write Out Escaped And Use Unescaped Markers", () => {
    const line = '\\"Stunde,Montag\\","x,y"\r\n';
    const result = c.convertCSVStringToArray(line, [","], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: ['"Stunde', 'Montag"', "x,y"],
      table: [],
    });
  });

  it("Write Out Escaped Inside Unescaped Markers", () => {
    const line = '\\"Stunde,"Montag\\"x,y"\r\n';
    const result = c.convertCSVStringToArray(line, [","], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: ['"Stunde', 'Montag"x,y'],
      table: [],
    });
  });

  it("Multiple Delimiters Inside Markers", () => {
    const line = 'Stunde,"Montag,x,y"\r\n';
    const result = c.convertCSVStringToArray(line, [","], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: ["Stunde", "Montag,x,y"],
      table: [],
    });
  });

  it("Multiple Escaped Markers Inside Col", () => {
    const line = '\\"S\\"t\\"u\\"nde,"Montag,x,y"\r\n';
    const result = c.convertCSVStringToArray(line, [","], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: ['"S"t"u"nde', "Montag,x,y"],
      table: [],
    });
  });

  it("Take Over Empty Columns", () => {
    const line = "Stunde,Montag,,y\r\n";
    const result = c.convertCSVStringToArray(line, [","], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: ["Stunde", "Montag", "", "y"],
      table: [],
    });
  });

  /* --- Mutliple Delimiters --- */

  it("Mutliple Delimiters", () => {
    const line = "Stunde,Montag;Dienstag,Mittwoch;Donnerstag,Freitag\r\n";
    const result = c.convertCSVStringToArray(line, [",", ";"], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: HEADER,
      table: [],
    });
  });

  it("Mutliple Delimiters Side By Side", () => {
    const line = ",;,\r\n";
    const result = c.convertCSVStringToArray(line, [",", ";"], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: ["", "", "", ""],
      table: [],
    });
  });

  it("All Possible Mutliple Delimiters", () => {
    const line = "a b,c;dxe\tf\r\n";
    const result = c.convertCSVStringToArray(
      line,
      [" ", "x", ",", ";", "\t"],
      '"'
    );
    expect(result).toEqual({
      type: "parseResult",
      header: ["a", "b", "c", "d", "e", "f"],
      table: [],
    });
  });

  it("Mulitple Delimiters Inside Markers", () => {
    const line = '"a;b,c d" e\r\n';
    const result = c.convertCSVStringToArray(line, [" ", ",", ";"], '"');
    expect(result).toEqual({
      type: "parseResult",
      header: ["a;b,c d", "e"],
      table: [],
    });
  });

  /* --- Component Functions --- */

  it("Count Matching Names 1", () => {
    const headline = ["nummer", "name", "name", "typ1", "typ2", "lvl_up"];
    const colNames = [
      "nummer",
      "name",
      "name_en",
      "typ1",
      "typ2",
      "entwickelt_aus",
      "bild",
    ];
    const result = c.countMatchingNames(headline, colNames);
    expect(result).toEqual(4);
  });

  it("Count Matching Names 2", () => {
    const headline = [
      "typ_name",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "typ_id",
    ];
    const colNames = ["typ_id", "typ_name"];
    const result = c.countMatchingNames(headline, colNames);
    expect(result).toEqual(2);
  });

  it("Count Matching Names 3", () => {
    const headline = [
      "Stunde",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
    ];
    const colNames = ["typ_id", "typ_name"];
    const result = c.countMatchingNames(headline, colNames);
    expect(result).toEqual(0);
  });

  it("Get Most Suitable Table Name 1", () => {
    const headline = ["nummer", "name", "name", "typ1", "typ2", "lvl_up"];
    const tableNames = ["gefangen", "pokedex", "typ"];
    const colNamesForTables = [
      ["gefangen_id", "pokedex_nummer", "spitzname", "staerke"],
      ["nummer", "name", "name_en", "typ1", "typ2", "entwickelt_aus", "bild"],
      ["typ_id", "typ_name"],
    ];
    const result = c.getMostSuitableTableName(
      headline,
      tableNames,
      colNamesForTables
    );
    expect(result).toEqual("pokedex");
  });

  it("Get Most Suitable Table Name 2", () => {
    const headline = [
      "typ_name",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "typ_id",
    ];
    const tableNames = ["gefangen", "pokedex", "typ"];
    const colNamesForTables = [
      ["gefangen_id", "pokedex_nummer", "spitzname", "staerke"],
      ["nummer", "name", "name_en", "typ1", "typ2", "entwickelt_aus", "bild"],
      ["typ_id", "typ_name"],
    ];
    const result = c.getMostSuitableTableName(
      headline,
      tableNames,
      colNamesForTables
    );
    expect(result).toEqual("typ");
  });

  it("Get Most Suitable Table Name 3", () => {
    const headline = [
      "Stunde",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
    ];
    const tableNames = ["gefangen", "pokedex", "typ"];
    const colNamesForTables = [
      ["gefangen_id", "pokedex_nummer", "spitzname", "staerke"],
      ["nummer", "name", "name_en", "typ1", "typ2", "entwickelt_aus", "bild"],
      ["typ_id", "typ_name"],
    ];
    const result = c.getMostSuitableTableName(
      headline,
      tableNames,
      colNamesForTables
    );
    expect(result).toEqual("gefangen"); // First index when nothing matches
  });

  it("Get Matching Cols 1", () => {
    const colNames = [
      "nummer",
      "name",
      "name_en",
      "typ1",
      "typ2",
      "entwickelt_aus",
      "bild",
    ];
    const headline = ["nummer", "name", "name", "typ1", "typ2", "lvl_up"];
    const result = c.getMatchingCols(colNames, headline);
    expect(result).toEqual([0, 1, -1, 3, 4, -1, -1]);
  });

  it("Get Matching Cols 2", () => {
    const colNames = ["typ_id", "typ_name"];
    const headline = [
      "typ_name",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "typ_id",
    ];
    const result = c.getMatchingCols(colNames, headline);
    expect(result).toEqual([5, 0]);
  });

  it("Get Matching Cols 3", () => {
    const colNames = ["gefangen_id", "pokedex_nummer", "spitzname", "staerke"];
    const headline = [
      "Stunde",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
    ];
    const result = c.getMatchingCols(colNames, headline);
    expect(result).toEqual([-1, -1, -1, -1]);
  });

  it("Get Mapping Result 1", () => {
    const colNames = [
      "nummer",
      "name",
      "name_en",
      "typ1",
      "typ2",
      "entwickelt_aus",
      "bild",
    ];
    const headerIndex = [0, 1, -1, 3, 4, -1, -1];
    const table = [
      ["#001", "Bulbasaur", "-----", "Grass", "Poison", "Level Up - 16"],
      ["#002", "Ivysaur", "-----", "Grass", "Poison", "Level Up - 32"],
      ["#003", "Venusaur", "-----", "Grass", "Poison", "-----"],
    ];
    const result = c.getMappingResult(colNames, headerIndex, table);
    expect(result).toEqual({
      columnNames: ["nummer", "name", "typ1", "typ2"],
      data: [
        ["#001", "Bulbasaur", "Grass", "Poison"],
        ["#002", "Ivysaur", "Grass", "Poison"],
        ["#003", "Venusaur", "Grass", "Poison"],
      ],
    });
  });

  it("Get Mapping Result 2", () => {
    const colNames = ["typ_id", "typ_name"];
    const headerIndex = [0, 5];
    const table = [
      ["1", "Mathematik", "Deutsch", "Englisch", "Mathematik", "Kunst"],
      ["2", "Sport", "Französisch", "Geschichte", "Sport", "Geschichte"],
      ["3", "Sport", "Religion (ev, kath)", "Kunst", "", "Kunst"],
    ];
    const result = c.getMappingResult(colNames, headerIndex, table);
    expect(result).toEqual({
      columnNames: ["typ_id", "typ_name"],
      data: [
        ["1", "Kunst"],
        ["2", "Geschichte"],
        ["3", "Kunst"],
      ],
    });
  });

  it("Get Mapping Result 3", () => {
    const colNames = ["gefangen_id", "pokedex_nummer", "spitzname", "staerke"];
    const headerIndex = [0, 1, 3, -1];
    const table = [
      ["1", "Mathematik", "Deutsch", "Englisch", "Mathematik", "Kunst"],
      ["2", "Sport", "Französisch", "Geschichte", "Sport", "Geschichte"],
      ["3", "Sport", "Religion (ev, kath)", "Kunst", "", "Kunst"],
    ];
    const result = c.getMappingResult(colNames, headerIndex, table);
    expect(result).toEqual({
      columnNames: ["gefangen_id", "pokedex_nummer", "spitzname"],
      data: [
        ["1", "Mathematik", "Englisch"],
        ["2", "Sport", "Geschichte"],
        ["3", "Sport", "Kunst"],
      ],
    });
  });
});
