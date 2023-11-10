class Mutations::BlockLanguage::BlockLanguage < Mutations::BaseMutation
  field :blockLanguage, Types::BlockLanguageType, null: true
  field :id, ID, null: true
  field :errors, [String], null: false

  def save_block_language(block_language)
    if block_language.save
      {
        blockLanguage: block_language,
        errors: []
      }
    else
      {
        blockLanguage: nil,
        errors: block_language.errors.full_messages
      }
    end
  end

  def destroy_block_language(block_language)
    block_language.destroy!
    {
      blockLanguage: nil,
      errors: []
    }
  rescue ActiveRecord::InvalidForeignKey
    {
      blockLanguage: nil,
      errors: ['EXISTING_REFERENCES']
    }
  end
end
