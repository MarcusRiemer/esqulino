require "./project.rb"

require "test/unit"
require "json"

# Tests all aspect of project creation and modification
class ProjectTest < Test::Unit::TestCase
  @@project_path = "../data/dev/projects/test/"

  # Checks whether existance checks work
  def test_exists
    proj = Project.new(@@project_path, false)
    assert_true(proj.exists?)

    proj = Project.new("nonexistant", false)
    assert_false(proj.exists?)
  end
  
  # Tests whether certain strings are IDs
  def test_is_string_id?
    assert_true(is_string_id?("00000000-1111-2222-3333-444444444444"))
    assert_true(is_string_id?("AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE"))
    assert_true(is_string_id?("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"))

    assert_false(is_string_id?("00000000111122223333444444444444"))
    assert_false(is_string_id?("AAAAAAAABBBBCCCCDDDDEEEEEEEEEEEE"))

    assert_false(is_string_id?("0000000-1111-2222-3333-444444444444"))
    assert_false(is_string_id?("AAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE"))

    assert_true(is_string_id?("4f1f31c8-4ea3-42bd-9ba3-76a4c1d459b0"))
    assert_true(is_string_id?("4F1F31C8-4EA3-42BD-9BA3-76A4C1D459B0"))
  end
end

