describe('Project List Page', () => {
    let projectList = element(by.id("available-projects"));
    let projects = projectList.all(by.tagName('project-list-item'));
    
    it('shows all available projects', () => {
        browser.get('/about/projects');

        // Expected projects should be present
        expect(by.id("available-projects")).toBeTruthy();
        expect(projects.count()).toEqual(5, "Number of expected projects");
    });

    it('navigates to an editor', () => {
        browser.get('/about/projects');
        
        // Ensure each link points to an editor
        projects.each(item => {
            let editButton = item.element(by.css('a.btn-edit-project'));
            expect(editButton.getAttribute("href")).toContain("editor");
        });
    });
});
