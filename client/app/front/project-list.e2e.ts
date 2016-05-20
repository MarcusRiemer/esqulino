describe('Project List Page', () => {
    let projectList = element(by.id("available-projects"));
    let projects = projectList.all(by.tagName('project-list-item'));
    
    it('shows all available projects', () => {
        browser.get('/about/projects');

        // 2 Projects should be present
        expect(by.id("available-projects")).toBeTruthy();
        expect(projects.count()).toEqual(2);
    });

    it('navigates to an editor', () => {
        browser.get('/about/projects');
        
        // Ensure each link points to an editor
        projects.each(item => {
            let editButton = item.element(by.css('a[name=btn-edit]'));
            expect(editButton.getAttribute("href")).toContain("editor");
        });
    });
});
