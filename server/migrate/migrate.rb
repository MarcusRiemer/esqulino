# Migrates the given project
def migrate_project(cli, project, target_version)
  from = project.api_version
  to = target_version
  

  cli.status_project(project, "Migrating resources to API Level \"#{to}\" ...")
  cli.print_indent do  
    cli.status "Resources:"
    cli.print_indent do
      cli.status "#{project.queries.length} Queries"
      cli.status "#{project.pages.length} Pages"
    end

    cli.status "Migrating queries"
    project.queries.each do |query|
      migrate_query(cli, project, query, target_version)
    end

    cli.status "Migrating pages"
    project.pages.each do |page|
      migrate_page(cli, project, page, target_version)
    end

    # Check whether the project actually needs an update
    cli.status "Migrating project data"
    cli.print_indent do
      if (from.nil? and to == "1") then
        cli.print_progress_line "Description" do
          project.whole_description['apiVersion'] = target_version
          project.save_description
        end
      else
        cli.status_progress_prefix("SKIP".blue, "Description")
      end
    end
  end
  
end

def migrate_query(cli, project, query, target_version)
  cli.print_indent do
    from = query.api_version
    to = target_version

    msg = cli.fmt_query(query, "Migrating from API \"#{from}\" to \"#{to}\"")

    if from == to then
      cli.status_progress_prefix("SKIP".blue, msg)
    elsif (from.nil? and to == "1") then
      cli.print_progress_line msg do
        query.model['apiVersion'] = target_version
        query.save_description
      end
    end
  end
end

def migrate_page(cli, project, page, target_version)
  cli.print_indent do
    from = page.api_version
    to = target_version

    msg = cli.fmt_page(page, "Migrating from API \"#{from}\" to \"#{to}\"")
    if from == to then
      cli.status_progress_prefix("SKIP".blue, msg)
    elsif (from.nil? and to == "1")  then
      cli.print_progress_line msg  do
        page.model['apiVersion'] = target_version
        page.save!
      end
    end
  end
end
