class Mutations::BlockLanguage::DestroyBlockLanguage < Mutations::BlockLanguage::BlockLanguage
  argument :id, ID, required: true

  def resolve(id:)
    block_language = BlockLanguage.find(id)
    destroy_block_language(block_language)
  rescue ActiveRecord::RecordNotFound
    {
      blockLanguage: nil,
      errors: ["Couldn't find BlockLanguage with 'id'=#{id}"]
    }
  end
end
