import { browser, element, by } from 'protractor'

class QueryCreatePage {
    private _testProjectId : string;

    constructor(projectId : string) {
        this._testProjectId = projectId;
    }
    
    get url() {
        return (`/editor/${this._testProjectId}/query/create`);
    }

    get typesEle() {
        return (element.all(by.name("queryType")));
    }

    get tablesEle() {
        return (element.all(by.name("queryTable")));
    }

    get nameEle() {
        return (element(by.name("inputName")));
    }

    get btnCreate() {
        return (element(by.id('toolbar-btn-create')));
    }

    get navbarActiveEle() {
        return (element(by.css("nav li.nav-item .router-link-active")));
    }

    indexForType(queryType : string) {
        switch (queryType) {
        case "select":
            return (0);
        case "insert":
            return (1);
        case "update":
            return (2);
        case "delete":
            return (3);
        default:
            throw new Error(`indexForType("${queryType}") => Unknown type`);
        }
    }
    
    createQuery(queryType : string, queryName : string) {
        browser.get(this.url);

        this.nameEle.sendKeys(queryName)
            .then( () => this.typesEle.get(this.indexForType(queryType)).click())
            .then( () => this.tablesEle.get(0).click())
            .then( () => this.btnCreate.click())
            .then( () => browser.waitForAngular())
            .then( () => {
                expect(browser.getCurrentUrl()).not.toEqual(this.url, "Not at new URL");
                expect(this.navbarActiveEle.getText()).toContain(queryName, "Not in Navbar");
            });
    }
}


describe('Test Project: Creating Queries', () => {
    const page = new QueryCreatePage("test");

    it("Correct Data", () => {
        browser.get(page.url);

        expect(page.typesEle.count()).toEqual(4, "Four types of queries");
        expect(page.typesEle.get(0).getAttribute('value')).toEqual("select");
        expect(page.typesEle.get(1).getAttribute('value')).toEqual("insert");
        expect(page.typesEle.get(2).getAttribute('value')).toEqual("update");
        expect(page.typesEle.get(3).getAttribute('value')).toEqual("delete");
        
        expect(page.tablesEle.count()).toEqual(1, "One table in the schema");
        expect(page.tablesEle.get(0).getAttribute('value')).toEqual("key_value");
    });

    it("SELECT", () => page.createQuery("select", "A" + Math.random().toString(36).substr(2)));
    it("INSERT", () => page.createQuery("insert", "A" + Math.random().toString(36).substr(2)));
    it("UPDATE", () => page.createQuery("update", "A" + Math.random().toString(36).substr(2)));
    it("DELETE", () => page.createQuery("delete", "A" + Math.random().toString(36).substr(2)));
});
