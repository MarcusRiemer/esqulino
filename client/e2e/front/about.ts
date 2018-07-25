import { browser, by } from 'protractor'

describe('About Page', () => {
  it('shows all relevant links', () => {
    browser.get('/');
    expect(browser.getTitle()).toEqual("BlattWerkzeug");

    // 4 navigation buttons should be present
    expect(by.id("about-examples")).toBeTruthy();
    expect(by.id("about-pupils")).toBeTruthy();
    expect(by.id("about-teachers")).toBeTruthy();
    expect(by.id("about-developers")).toBeTruthy();
  });
});
