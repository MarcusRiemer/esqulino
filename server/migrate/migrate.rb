# This class needs to be implemented to do an update on models. Migrators must
# *never* write anything to disk, as this could cause inconsistencies if later
# migrations stumble upon some kind of error.
#
# All migrate_xyz methods *must* be explicitly implemented. If they don't
# actually need to do anything an empty implementation is fine. But we won't
# risk any migrations to be implicitly lost for whatever reason (typo,
# misunderstanding, ...)
class Migrator
  def initialize(from_version, to_version)
    @from_version = from_version
    @to_version = to_version
  end

  attr_reader :from_version, :to_version

  # Simply bumps the version of the given model to the
  # target version.
  def bump_version(model)
    model['apiVersion'] = @to_version.to_s
  end

  # Migrates the model of the given project
  def migrate_project(model)
    self.migrate_project_impl(model)
    self.bump_version(model)
  end

  # Must be implemented by deriving classes, if no changes to the project have
  # occured an empty implementation is fine.
  def migrate_project_impl(model)
    raise "Project migration not implemented"
  end

  def migrate_page(model)
    self.migrate_page_impl(model)
    self.bump_version(model)
  end

  # Must be implemented by deriving classes, if no changes to the page have
  # occured an empty implementation is fine.
  def migrate_page_impl(model)
    raise "Page migration not implemented"
  end

  def migrate_query(model)
    self.migrate_query_impl(model)
    self.bump_version(model)
  end

  # Must be implemented by deriving classes, if no changes to the query have
  # occured an empty implementation is fine.
  def migrate_query_impl(model)
    raise "Query migration not implemented"
  end

end

# Migrates from API version 1 to 2. This version changed to page model:
# 
# Pages now may use any widget at the  first child level, not only rows.
# This means that:
#
# * The root element for widgets on a page is renamed to 'widgets' from 'rows'
# * Column and Row widgets need their respective type declared in the model
class Migrate1to2 < Migrator
  def initialize
    super(1,2)
  end

  # No change
  def migrate_project_impl(model)
  end

  # No change
  def migrate_query_impl(model)
  end

  # Renaming: 'rows' => 'widgets'
  def migrate_page_impl(model)
    # Add type "row" to rows
    rows = model['rows']
    rows.each do |row|
      row['type'] = 'row'
      columns = row['columns']
      # Add type "columns" to columns
      columns.each do |column|
        column['type'] = 'column'
      end
    end
    
    # Rename the root element
    model['widgets'] = rows
    model.delete('rows')
    
    bump_version(model)
  end
end

$migrators = {
  1 => Migrate1to2.new
}

# Migrates the given project
#
# @param cli The cli-instance, used for pretty-printed output
# @param project The project to update
# @param target_version The version that should be reached
def migrate_project(cli, project, target_version)
  from = project.api_version.to_i
  to = target_version.to_i

  migrator = $migrators.fetch(from)
  raise "Wrong target version #{migrator.to_version}" if migrator.to_version != target_version
  

  cli.status_project(project, "Migrating resources to API Level #{to} ...")
  cli.print_indent do  
    cli.status "Resources:"
    cli.print_indent do
      cli.status "#{project.queries.length} Queries"
      cli.status "#{project.pages.length} Pages"
    end

    cli.status "Migrating queries"
    project.queries.each do |query|
      migrate_query(cli, project, query, migrator)
    end

    cli.status "Migrating pages"
    project.pages.each do |page|
      migrate_page(cli, project, page, migrator)
    end

    # Check whether the project actually needs an update
    cli.status "Migrating project data"
    cli.print_indent do
      if (from == to) then
        cli.status_progress_prefix("SKIP".blue, "Description")
      else
        cli.print_progress_line "Description" do
          migrator.migrate_project(project.whole_description)
          project.save_description
        end
      end
    end
  end
  
end

# Migrates a single query
#
# @param cli The cli-instance, used for pretty-printed output
# @param project The project this query belongs to
# @param query The query to update
# @param migrator The migrator to use
def migrate_query(cli, project, query, migrator)
  cli.print_indent do
    from = query.api_version.to_i
    to = migrator.to_version.to_i

    msg = cli.fmt_query(query, "Migrating from API #{from} to #{to}")

    if from == to then
      cli.status_progress_prefix("SKIP".blue, msg)
    else
      cli.print_progress_line msg  do
        migrator.migrate_query(query.model)
        # This does not touch the SQL representation, which probably
        # shouldn't change when doing a migration
        query.save_description
      end
    end
  end
end

# Migrates a single page
#
# @param cli The cli-instance, used for pretty-printed output
# @param project The project this page belongs to
# @param query The query to update
# @param migrator The migrator to use
def migrate_page(cli, project, page, migrator)
  cli.print_indent do
    from = page.api_version.to_i
    to = migrator.to_version.to_i

    msg = cli.fmt_page(page, "Migrating from API #{from} to #{to}")
    if from == to then
      cli.status_progress_prefix("SKIP".blue, msg)
    else
      cli.print_progress_line msg  do
        migrator.migrate_page(page.model)
        page.save!
      end
    end
  end
end
