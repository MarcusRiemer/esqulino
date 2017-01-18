import { browser, element, by } from 'protractor'

describe('Test Project: Schema', () => {
    const testProjectId = "test";
    const schemaUrl = `/editor/${testProjectId}/schema`;

    it("displays all tables", () => {
        browser.get(schemaUrl);

        const tablesEle = element.all(by.css("#schema-tables table tbody"));
        expect(tablesEle.count()).toEqual(2, "Not exactly two tables");
    });
});
