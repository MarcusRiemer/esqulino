require 'test_helper'

class LanguageModelTest < ActiveSupport::TestCase
  test "Fixtures exist" do
    # Yes this is a dumb test. But it ensures that the database has been setup correctly
    assert 2, LanguageModel.count
  end

  test "Inserting a language model without a name" do
    m = LanguageModel.new
    assert_not m.valid?
  end
  
  test "Inserting a language model without the block descriptions" do
    m = LanguageModel.new(name: 'noblocks', model: Hash.new)
    assert_not m.valid?
  end

  test "Inserting a language model with explicitly empty block descriptions" do
    m = LanguageModel.new(name: 'noblocks', model: {
                            'editorBlocks' => [],
                            'sidebarBlocks' => []
                          })
    assert m.valid?
  end
end
