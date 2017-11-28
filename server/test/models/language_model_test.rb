require 'test_helper'

class LanguageModelTest < ActiveSupport::TestCase
  test "Fixtures exist" do
    # Yes this is a dumb test. But it ensures that the database has been setup correctly
    assert 2, LanguageModel.count
  end
end
