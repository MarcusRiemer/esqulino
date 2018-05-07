import * as c from './csv-parser'

describe('Util: CSV Parser', () => {

  it('Split Row To Col Easy', () => {
    const row = c.splitRowToCols('a', ',', '"');
    expect(row).toEqual(['a']);
  });

  it('Split Row To Col Medium', () => {
    const row = c.splitRowToCols('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag', ',', '"');
    expect(row).toEqual(['Stunde', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']);
  });

  it('Split Row To Col Hard', () => {
    const row = c.splitRowToCols('3,Sport,"Religion (ev, kath)",Kunst,,Kunst', ',', '"');
    expect(row).toEqual(['3', 'Sport', 'Religion (ev, kath)', 'Kunst', '', 'Kunst']);
  });

  it('Split String To Row Easy', () => {
    const row = c.splitStringToRows('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag');
    expect(row).toEqual(['Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag']);
  });

  it('Split Row Medium', () => {
    const row = c.splitStringToRows('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag\n'
                                    + '1,Mathematik,Deutsch,Englisch,Mathematik,Kunst\n'
                                    + '2,Sport,Französisch,Geschichte,Sport,Geschichte\n'
                                    + '3,Sport,"Religion (ev, kath)",Kunst,,Kunst');
    expect(row).toEqual(['Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag', 
                         '1,Mathematik,Deutsch,Englisch,Mathematik,Kunst',
                         '2,Sport,Französisch,Geschichte,Sport,Geschichte',
                         '3,Sport,"Religion (ev, kath)",Kunst,,Kunst']);
  });

  it('Split Row Hard', () => {
    const row = c.splitStringToRows('Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag\r\n'
                                    + '1,Mathematik,Deutsch,Englisch,Mathematik,Kunst\r\n'
                                    + '2,Sport,Französisch,Geschichte,Sport,Geschichte\r\n'
                                    + '3,Sport,"Religion (ev, kath)",Kunst,,Kunst');
    expect(row).toEqual(['Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag', 
                         '1,Mathematik,Deutsch,Englisch,Mathematik,Kunst',
                         '2,Sport,Französisch,Geschichte,Sport,Geschichte',
                         '3,Sport,"Religion (ev, kath)",Kunst,,Kunst']);
  });

});
