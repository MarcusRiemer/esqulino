class Mutations::SeedData::StoreBlockLanguage < Mutations::BaseMutation
  # The IDs of block languages that should be stored
  argument :block_languages, [String], required: true

  field :affected_ids, [[Types::Response::AffectedResource]], null: true
  field :errors, [String], null: false

  def resolve(block_languages:)
    block_languages.each do |id|
      b = BlockLanguage.find_by!(id: id)
      authorize b, :store_seed?
    end

    affected = block_languages.map do |id|
      SeedManager.instance.store_block_language id
    end

    affected_result = affected.map do |block_language_set|
      block_language_set.map do |stored|
        {
          id: stored[1],
          type: stored[2].name.demodulize
        }
      end
    end

    return {
      affected_ids: affected_result,
      errors: []
    }
  end
end