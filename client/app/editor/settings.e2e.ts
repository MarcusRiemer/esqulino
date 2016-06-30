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
            .then( () => nameEle.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a"), nameVal))
            .then( () => descEle.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a"), descVal))
            .then( () => saveBtn.click())
            .then( () => browser.waitForAngular())
            .then( () => {
                // And reload the page, asserting that everything has been saved
                browser.get(settingsUrl);

                // Ensure everything has been saved
                expect(nameEle.getAttribute("value")).toEqual(nameVal, "Name differed");
                expect(descEle.getAttribute("value")).toEqual(descVal, "Description differed");
            });
    });

    it('query rename reflected in navbar', () => {
        browser.get(settingsUrl);

        const someQuery = element.all(by.css('#project-queries input[type=text]')).first();
        const nameVal = Math.random().toString(36).substr(2);

        someQuery.clear()
            .then( () => someQuery.sendKeys(nameVal))
            .then( () => browser.waitForAngular())
            .then( () => {
                // Make sure the sidebar is updated correctly
                const navQueries = element(by.css(".nav-query")).all(by.css("a.nav-link"));
                navQueries
                    .filter(n => n.getText().then(t => t.includes(nameVal)))
                    .then(res => expect(res.length).toEqual(1, "Exactly 1 item should have the new name"));
            })
    });
    
    it('can delete all queries', () => {
        browser.get(settingsUrl);

        const querBtnDelete = element(by.id('project-queries'))
            .all(by.css("button"));

        querBtnDelete
            .map( e => e.click())
            .then( () => browser.waitForAngular() )
            .then( () => {
                // Reload page and assure there are no queries left
                browser.get(settingsUrl);
                expect(querBtnDelete.count()).toEqual(0);
            });
    });
});
