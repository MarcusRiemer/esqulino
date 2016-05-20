describe('Test Project: Settings', () => {
    const testProjectId = "test";

    it('can be saved', () => {
        browser.get(`/editor/${testProjectId}/settings`);

        let description = element(by.id('project-name'));
        const randomToken = Math.random().toString(36);
        
        description.clear();
        description.sendKeys(randomToken);
    });
});
