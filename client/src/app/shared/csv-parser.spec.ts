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

  it('Split Row To Columns Easy', () => {
    const row = c.splitRowToCols('a', ',', '"');
    expect(row).toEqual(['a']);
  });

  it('Split Row To Columns Medium', () => {
    const row = c.splitRowToCols('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag', ',', '"');
    expect(row).toEqual(['Stunde', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']);
  });

  it('Split Row To Columns Hard', () => {
    const row = c.splitRowToCols('3,Sport,"Religion (ev, kath)",Kunst,,Kunst', ',', '"');
    expect(row).toEqual(['3', 'Sport', 'Religion (ev, kath)', 'Kunst', '', 'Kunst']);
  });

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

  it('Convert CSV String to Array', () => {
    const result = c.convertCSVStringToArray(CSV_STRING, ',', '"');
    expect(result).toEqual(CSV_TO_ARRAY);
  });

  /* ---------- Tests with corrupted CSV files ---------- */

  // TODO: THROW ERRORS

  // CSV String with different Column Counts
  const DIFFERENT_COL_COUNTS = ('Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n' // 5 Cols
                              + '1,Mathematik,Kunst\r\n' // 3 Cols
                              + '2,Sport,Geschichte,Sport,Geschichte,Sport\r\n' // 6 Cols
                              + 'x,"Religion (ev, kath)", x'); // 2 Cols

  /*                              
  // Expect Result to have the max Count of Columns and 
  // use empty Cols if Row has less Cols as Max
  const DIFFERENT_COL_COUNTS_RESULT = [['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', ''],
                                       ['1', 'Mathematik', 'Kunst', '', '', ''],
                                       ['2', 'Sport', 'Geschichte', 'Sport', 'Geschichte', 'Sport'],
                                       ['Religion (ev, kath)', '', '', '', '', '']];
  */

  const DIFFERENT_COL_COUNTS_RESULT = [['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'],
                                       ['1', 'Mathematik', 'Kunst'],
                                       ['2', 'Sport', 'Geschichte', 'Sport', 'Geschichte', 'Sport'],
                                       ['x', 'Religion (ev, kath)', ' x']];
  
  it('Different Column Counts', () => {
    const result = c.convertCSVStringToArray(DIFFERENT_COL_COUNTS, ',', '"');
    expect(result).toEqual(DIFFERENT_COL_COUNTS_RESULT);
  });

});
