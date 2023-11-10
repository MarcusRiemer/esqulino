class Mutations::SeedData::StoreProject < Mutations::BaseMutation
  # The IDs or slugs of project that should be saved
  argument :projects, [String], required: true

  field :affected_ids, [[Types::Response::AffectedResource]], null: true
  field :errors, [String], null: false

  def resolve(projects:)
    projects.each do |id_or_slug|
      p = Project.find_by_slug_or_id! id_or_slug
      authorize p, :store_seed?
    end

    affected = projects.map do |id_or_slug|
      SeedManager.instance.store_project id_or_slug
    end

    affected_result = affected.map do |project_set|
      project_set.map do |stored|
        {
          id: stored[1],
          type: stored[2].name.demodulize
        }
      end
    end

    {
      affected_ids: affected_result,
      errors: []
    }
  end
end
