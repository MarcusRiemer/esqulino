import { browser, element, by } from 'protractor'

declare var protractor : any;

describe('Test Project: Creating Pages', () => {
    const testProjectId = "test";
    const editorUrl = `/editor/${testProjectId}/page/create`;

    const nameEle = element(by.name("pageName"));

    const createBtn = element(by.id('toolbar-btn-create'));

    const navbarActiveEle = element(by.css("nav li.nav-item .router-link-active"));

    it('Valid name', () => {
        // Name must begin with a letter
        const nameVal = "A" + Math.random().toString(36).substr(2);
        
        browser.get(editorUrl);
        nameEle.sendKeys(protractor.Key.chord(protractor.Key.CONTROL, "a"), nameVal)
            .then( () => browser.waitForAngular() )
            .then( () => createBtn.click() )
            .then( () => browser.waitForAngular() )
            .then( () => {
                expect(browser.getCurrentUrl()).not.toEqual(this.url, "Not at new URL");
                expect(navbarActiveEle.getText()).toContain(nameVal, "Not in Navbar");
            });
    });
})
