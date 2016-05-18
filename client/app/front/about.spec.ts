describe('About Page', () => {
    it('Shows all relevant links', () => {
        browser.get('/');
        expect(browser.getTitle()).toEqual("esqulino");
        expect(by.id("about-pupils")).toBeTruthy();
        expect(by.id("about-teachers")).toBeTruthy();
        expect(by.id("about-developers")).toBeTruthy();
    });
});
