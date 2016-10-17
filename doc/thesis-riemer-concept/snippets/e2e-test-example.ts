describe('Test Project: Settings', () => {
  const testProjectId = "test";
  const settingsUrl = `/editor/${testProjectId}/settings`;
  const saveBtn = element(by.id('toolbar-btn-save'));
    
  it('can be edited & saved', () => {
    browser.get(settingsUrl);

    // Random name & description
    const nameEle = element(by.id('project-name'));
    const nameVal = Math.random().toString(36).substr(2);
    const descEle = element(by.id('project-description'));
    const descVal = Math.random().toString(36).substr(2);

    // Setting it
    nameEle.clear()
      .then( () => nameEle.sendKeys(Key.chord(Key.CONTROL, "a"), nameVal))
      .then( () => descEle.sendKeys(Key.chord(Key.CONTROL, "a"), descVal))
      .then( () => saveBtn.click())
      .then( () => {
        // Reload the page, asserting that everything has been saved
        browser.get(settingsUrl);

        // Ensure everything has been saved
        expect(nameEle.getAttribute("value")).toEqual(nameVal, "Name differed");
        expect(descEle.getAttribute("value")).toEqual(descVal, "Description differed");
    });
  });
});
