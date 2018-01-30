require 'test_helper'

require_dependency 'project'

class ProjectTest < ActiveSupport::TestCase

  # The folder projects for tests are stored in
  def test_projects_folder
    Rails.application.config.sqlino[:projects_dir]
  end
  
  # Tests whether certain strings are IDs
  test 'is_string_id?' do
    assert is_string_id?('00000000-1111-2222-3333-444444444444')
    assert is_string_id?('AAAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE')
    assert is_string_id?('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')

    assert_not is_string_id?('00000000111122223333444444444444')
    assert_not is_string_id?('AAAAAAAABBBBCCCCDDDDEEEEEEEEEEEE')

    assert_not is_string_id?('0000000-1111-2222-3333-444444444444')
    assert_not is_string_id?('AAAAAAA-BBBB-CCCC-DDDD-EEEEEEEEEEEE')

    assert is_string_id?('4f1f31c8-4ea3-42bd-9ba3-76a4c1d459b0')
    assert is_string_id?('4F1F31C8-4EA3-42BD-9BA3-76A4C1D459B0')
  end

  # Ensure parameters actually get through
  test 'Project creation parameters' do
    p = ProjectCreationParams.new ({
                                     'id' => 'test-id',
                                     'name' => 'test-name',
                                     'dbType' => 'sqlite3',
                                     'admin' => {
                                       'name' => 'test-admin',
                                       'password' => 'test-pw'
                                     }
                                   })

    assert_equal 'test-id', p.id
    assert_equal 'test-name', p.name
    assert_equal 'sqlite3', p.db_type
    assert_equal 'test-admin', p.admin_name
    assert_equal 'test-pw', p.admin_password


    project_description = {
      'name' => 'test-name',
      'description' => '',
      'apiVersion' => '4',
      'public' => false,
      'databases' => { },
      'users' => { }
    }
  end

  test 'Actual project creation' do
    project_desc = ProjectCreationParams.new({
                                               'id' => 'test-id',
                                               'name' => 'test-name',
                                               'dbType' => 'sqlite3',
                                               'admin' => {
                                                 'name' => 'test-admin',
                                                 'password' => 'test-pw'
                                               }
                                             })

    create_project test_projects_folder, project_desc

    p = Project.new File.join(test_projects_folder, 'test-id'), false

    assert p.exists?
    assert_equal "test-id", p.id
    assert_not p.public?

    assert_equal "", p.public_description['description']    
    assert_equal "test-name", p.public_description['name']

    # TODO: Passwords are currently hardcoded
    # assert p.verify_password "test-admin", "test-pw"
    assert p.verify_password "user", "user"

    rollback_test_filesystem
  end

  test 'Project creation and deletion' do
    project_desc = ProjectCreationParams.new({
                                               'id' => 'test-id',
                                               'name' => 'test-name',
                                               'dbType' => 'sqlite3',
                                               'admin' => {
                                                 'name' => 'test-admin',
                                                 'password' => 'test-pw'
                                               }
                                             })

    create_project test_projects_folder, project_desc

    p = Project.new File.join(test_projects_folder, 'test-id'), true

    assert p.exists?
    p.delete!
    assert_not p.exists?    

    rollback_test_filesystem
  end
end

