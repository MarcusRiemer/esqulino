class Mutations::SeedData::StoreProject < Mutations::BaseMutation
  # The IDs or slugs of project that should be saved
  argument :projects, [String], required: true

  # Something that was stored during the seeding operation
  class StoredSeed < Types::Base::BaseObject
    field :id, ID, null: false
    field :type, String, null: false
  end

  field :affected_ids, [[StoredSeed]], null: true
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
          type: stored[2].name
        }
      end
    end

    return {
      affected_ids: affected_result,
      errors: []
    }
  end
end