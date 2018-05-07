import * as c from './csv-parser'

describe('Util: CSV Parser', () => {

  it('Split Row', () => {
    const row = c.splitRow("a", ",", "\"");
    expect(row).toEqual(['a']);
  });

  it('Split Row', () => {
    const row = c.splitRow("Stunde,Montag,Dienstag,Mittwoch,Donnerstag,Freitag", ",", "\"");
    expect(row).toEqual(['Stunde', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag']);
  });

  it('Split Row', () => {
    const row = c.splitRow("3,Sport,\"Religion (ev, kath)\",Kunst,,Kunst", ",", "\"");
    expect(row).toEqual(['3', 'Sport', 'Religion (ev, kath)', 'Kunst', '', 'Kunst']);
  });

});
