describe('Test Project: Settings', () => {
    const testProjectId = "test";

    const saveBtn = element(by.id('toolbar-btn-save'));

    it('can be edited & saved', () => {
        browser.get(`/editor/${testProjectId}/settings`);

        // Random name & description
        let nameEle = element(by.id('project-name'));
        const nameVal = Math.random().toString(36).substr(2);
        let descEle = element(by.id('project-description'));
        const descVal = Math.random().toString(36).substr(2);

        // Setting it
        nameEle.clear()
            .then( () => nameEle.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a"), nameVal))
            .then( () => descEle.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a"), descVal))
            .then( () => saveBtn.click())
            .then( () => browser.waitForAngular())
            .then( () => {
                // And reload the page, asserting that everything has been saved
                browser.get(`/editor/${testProjectId}/settings`);

                // Ensure everything has been saved
                expect(nameEle.getAttribute("value")).toEqual(nameVal, "Name differed");
                expect(descEle.getAttribute("value")).toEqual(descVal, "Description differed");
            });
    });
});
