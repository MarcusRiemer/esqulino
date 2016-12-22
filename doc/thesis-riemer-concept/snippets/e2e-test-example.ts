import { browser, element, by } from 'protractor'

describe('Test Project: Settings', () => {
  const settingsUrl = `/editor/test/settings`;
  it('can be edited & saved', () => {
    browser.get(settingsUrl);
    // Random name & description
    const nameEle = element(by.id('project-name'));
    const nameVal = Math.random().toString(36).substr(2);
    const descEle = element(by.id('project-description'));
    const descVal = Math.random().toString(36).substr(2);
    // Setting it
    nameEle.clear()
      .then( () => nameEle.sendKeys("CTRL+a"), nameVal))
      .then( () => descEle.sendKeys("CTRL+a"), descVal))
      .then( () => element(by.id('toolbar-btn-save')).click())
      .then( () => {
        // Reload the page, asserting that everything has been saved
        browser.get(settingsUrl);
        // Ensure everything has been saved
        expect(nameEle.getAttribute("value")).toEqual(nameVal, "Name differed");
        expect(descEle.getAttribute("value")).toEqual(descVal, "Description differed");
    });
  });
});
