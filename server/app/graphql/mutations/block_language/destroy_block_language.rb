class Mutations::BlockLanguage::DestroyBlockLanguage < Mutations::BlockLanguage::BlockLanguage
  argument :id, ID, required: true

  def resolve(id:)
    begin
      block_language = BlockLanguage.find(id)
      destroy_block_language(block_language)
    rescue ActiveRecord::RecordNotFound
      {
        news: nil,
        errors: ["Couldn't find BlockLanguage with 'id'=#{id}"]
      }
    end
  end
end
