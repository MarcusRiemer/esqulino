import * as c from './csv-parser'

describe('Util: CSV Parser', () => {

  const CSV_STRING = ('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n'
                    + '1,Mathematik,Deutsch,Englisch,Mathematik,Kunst\r\n'
                    + '2,Sport,Französisch,Geschichte,Sport,Geschichte\r\n'
                    + '3,Sport,"Religion (ev, kath)",Kunst,,Kunst');

  const ROWS_ONLY = ['Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag', 
                     '1,Mathematik,Deutsch,Englisch,Mathematik,Kunst',
                     '2,Sport,Französisch,Geschichte,Sport,Geschichte',
                     '3,Sport,"Religion (ev, kath)",Kunst,,Kunst'];

  const CSV_TO_ARRAY = [['Stunde', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'],
                        ['1', 'Mathematik', 'Deutsch', 'Englisch', 'Mathematik', 'Kunst'],
                        ['2', 'Sport', 'Französisch', 'Geschichte', 'Sport', 'Geschichte'],
                        ['3', 'Sport', 'Religion (ev, kath)', 'Kunst', '', 'Kunst']];

  const HEADER = ['Stunde', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];

  const TABLE = [['1', 'Mathematik', 'Deutsch', 'Englisch', 'Mathematik', 'Kunst'],
                 ['2', 'Sport', 'Französisch', 'Geschichte', 'Sport', 'Geschichte'],
                 ['3', 'Sport', 'Religion (ev, kath)', 'Kunst', '', 'Kunst']];

  const CSV_AS_JSON = { 
    'rows':
      [
        {
          'Stunde': '1',
          'Montag': 'Mathematik',
          'Dienstag': 'Deutsch',
          'Mittwoch': 'Englisch',
          'Donnerstag': 'Mathematik',
          'Freitag': 'Kunst'
        },
        {
          'Stunde': '2',
          'Montag': 'Sport',
          'Dienstag': 'Französisch',
          'Mittwoch': 'Geschichte',
          'Donnerstag': 'Sport',
          'Freitag': 'Geschichte'
        },
        {
          'Stunde': '3',
          'Montag': 'Sport',
          'Dienstag': 'Religion (ev, kath)',
          'Mittwoch': 'Kunst',
          'Donnerstag': '',
          'Freitag': 'Kunst'
        }
      ]
  }


  /* ---------- Successful Parse Tests ---------- */ 

  /* ----- splitStringToRows Function ----- */ 

  it('Split String To Rows Easy', () => {
    const row = c.splitStringToRows('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag');
    expect(row).toEqual(['Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag']);
  });

  it('Split String To Rows Medium', () => {
    const row = c.splitStringToRows(CSV_STRING);
    expect(row).toEqual(ROWS_ONLY);
  });

  it('Split String To Rows Hard', () => {
    const row = c.splitStringToRows(CSV_STRING);
    expect(row).toEqual(ROWS_ONLY);
  });

  /* ----- splitRowToCols Function ----- */

  it('Split Row To Columns Easy', () => {
    const result = c.splitRowToCols('a', ',', '"', 1);
    expect(result).toEqual({
      type: "row",
      data: ['a']
    });
  });

  it('Split Row To Columns Medium', () => {
    const result = c.splitRowToCols('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag', ',', '"', 6);
    expect(result).toEqual({
      type: "row",
      data: ['Stunde', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']
    });
  });

  it('Split Row To Columns Hard', () => {
    const row = c.splitRowToCols('3,Sport,"Religion (ev, kath)",Kunst,,Kunst', ',', '"', 6);
    expect(row).toEqual({
      type: "row",
      data: ['3', 'Sport', 'Religion (ev, kath)', 'Kunst', '', 'Kunst']
    });
  });

  /* ----- convertArraysToJSON Function ----- */

  it('Convert Arrays To JSON Easy', () => {
    const data = [['1'],
                  ['2'],
                  ['3']];
    const header = ['Stunde'];
    const result = { 
                      'rows':
                        [
                          {
                            'Stunde': '1'
                          },
                          {
                            'Stunde': '2'
                          },
                          {
                            'Stunde': '3'
                          }
                        ]
    }
    const JSONData = c.convertArraysToJSON(data, header, true);
    expect(JSONData).toEqual(result);
  });

    it('Convert Arrays To JSON Medium', () => {
    const data = [['1', 'Mathematik', 'Deutsch', 'Englisch', 'Mathematik', 'Kunst'],
                  ['2', 'Sport', 'Französisch', 'Geschichte', 'Sport', 'Geschichte'],
                  ['3', 'Sport', 'Religion (ev, kath)', 'Kunst', '', 'Kunst']];
    const header = ['Stunde', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
    const JSONData = c.convertArraysToJSON(data, header, true);
    expect(JSONData).toEqual(CSV_AS_JSON);
  });
  
  it('Convert Arrays To JSON Hard', () => {
    const JSONData = c.convertArraysToJSON(CSV_TO_ARRAY, [], false);
    expect(JSONData).toEqual(CSV_AS_JSON);
  });

  /* ----- convertCSVStringToArray Function ----- */

  it('Convert CSV String to Array', () => {
    const result = c.convertCSVStringToArray(CSV_STRING, ',', '"');
    expect(result).toEqual({
      type: "parseResult",
      header: HEADER,
      table: TABLE
    });
  });


  /* ---------- Tests with corrupted CSV files ---------- */

  /* ----- One Different Column Count ----- */

  let Table = ('Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n' // 5 Cols
             + '1,Mathematik,Kunst'); // 3 Cols

  let Errors = 
  [
    {
      line: 2,
      data: 
      {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line",
        count: 3,
        expected: 5
      }
    }
  ]

  
  it('One Different Column Count', () => {
    const result = c.convertCSVStringToArray(Table, ',', '"');
    expect(result).toEqual({
      type: "parseError",
	    errors: Errors
    });
  });


  /* ----- Multiple Different Column Counts ----- */

  Table = ('Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n' // 5 Cols
         + '1,Mathematik,Kunst\r\n' // 3 Cols
         + '2,Sport,Geschichte,Sport,Geschichte,Sport\r\n' // 6 Cols
         + 'x,"Religion (ev, kath)",x'); // 3 Cols

  Errors = 
  [
    {
      line: 2,
      data: 
      {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line",
        count: 3,
        expected: 5
      }
    },
    {
      line: 3,
      data: 
      {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line",
        count: 6,
        expected: 5
      }
    },
    {
      line: 4,
      data: 
      {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line",
        count: 3,
        expected: 5
      }
    }
  ]


  it('Multiple Different Column Counts', () => {
    const result = c.convertCSVStringToArray(Table, ',', '"');
    expect(result).toEqual({
      type: "parseError",
      errors: Errors
    });
  });

  /* ----- Different And Same Column Counts ----- */

  Table = ('Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n' // 5 Cols
         + '1,Mathematik,Kunst, Sport, Englisch, Sport\r\n' // 6 Cols
         + '2,Sport,Geschichte,Sport,Geschichte\r\n' // 5 Cols
         + 'x,"Religion (ev, kath)",x'); // 3 Cols

  Errors = 
  [
    {
      line: 2,
      data: 
      {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line",
        count: 6,
        expected: 5
      }
    },
    {
      line: 4,
      data: 
      {
        type: "wrongColumnCount",
        information: "Expected column count to match with first line",
        count: 3,
        expected: 5
      }
    }
  ]
  
  it('Different And Same Column Counts', () => {
    const result = c.convertCSVStringToArray(Table, ',', '"');
    expect(result).toEqual({
      type: "parseError",
      errors: Errors
    });
  });

  /* ----- Marker Not Closed In One Line ----- */
  it('Marker Not Closed In One Line', () => {
    const line = 'Montag,"Dienstag,Mittwoch",Donnerstag,"Freitag'
    const result = c.splitRowToCols(line, ',', '"', 4);
    expect(result).toEqual({
      type: "markerNotClosed",
			information: "The selected marker was opened but not closed in line",
			fragment: "Freitag"
    });
  });

  /* ----- Marker Not Closed In Mutliple Lines ----- */

  /* ----- Marker Not Closed With Escaped Markers ----- */

  /* ----- Marker Not Closed And Wrong Column Counts ----- */

  /* ---------- Special Cases ---------- */

  // Line Break at the end of the File
  // Ignore empty lines
  // One Column before or after marker
  // Escaped Markers

});