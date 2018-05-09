import * as c from './csv-parser'

describe('Util: CSV Parser', () => {

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
    const row = c.splitStringToRows('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag\n'
                                    + '1,Mathematik,Deutsch,Englisch,Mathematik,Kunst\n'
                                    + '2,Sport,Französisch,Geschichte,Sport,Geschichte\n'
                                    + '3,Sport,"Religion (ev, kath)",Kunst,,Kunst');
    expect(row).toEqual(['Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag', 
                         '1,Mathematik,Deutsch,Englisch,Mathematik,Kunst',
                         '2,Sport,Französisch,Geschichte,Sport,Geschichte',
                         '3,Sport,"Religion (ev, kath)",Kunst,,Kunst']);
  });

  it('Split String To Rows Hard', () => {
    const row = c.splitStringToRows('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n'
                                    + '1,Mathematik,Deutsch,Englisch,Mathematik,Kunst\r\n'
                                    + '2,Sport,Französisch,Geschichte,Sport,Geschichte\r\n'
                                    + '3,Sport,"Religion (ev, kath)",Kunst,,Kunst');
    expect(row).toEqual(['Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag', 
                         '1,Mathematik,Deutsch,Englisch,Mathematik,Kunst',
                         '2,Sport,Französisch,Geschichte,Sport,Geschichte',
                         '3,Sport,"Religion (ev, kath)",Kunst,,Kunst']);
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

    it('Convert Arrays To JSON Hard', () => {
    const data = [['1', 'Mathematik', 'Deutsch', 'Englisch', 'Mathematik', 'Kunst'],
                  ['2', 'Sport', 'Französisch', 'Geschichte', 'Sport', 'Geschichte'],
                  ['3', 'Sport', 'Religion (ev, kath)', 'Kunst', '', 'Kunst']];
    const header = ['Stunde', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag'];
    const result = { 
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
    const JSONData = c.convertArraysToJSON(data, header, true);
    expect(JSONData).toEqual(result);
  });    

});
