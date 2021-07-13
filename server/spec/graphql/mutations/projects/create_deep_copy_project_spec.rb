require "rails_helper"

RSpec.fdescribe Mutations::Projects::CreateDeepCopyProject do

  # These specs relies on
  # * an existing guest user
  # * an existing meta grammar language
  before(:each) {
    create(:user, :guest)
  }

  def init_args(user: User.guest)
    {
      context: {
        user: user
      },
      object: nil,
      field: nil,
    }
  end


  it "user have not the permissions" do
    #ToDo
  end

  it "change the owner of the copied project" do
    creator = create(:user, display_name: "Creator")
    current = create(:user, display_name: "Current")
    project = create(:project, user: creator, slug: "Testproject")

    
    mut = described_class.new(**init_args(user: current))

    res = mut.resolve(project_id: project.id, new_slug: "tester")

    expect(Project.find(project.id).user).not_to eq Project.find(res[:project][:id]).user

    expect(Project.find(res[:project][:id]).user.display_name).to eq "Current"
  end

  it "delete all members" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator, slug: "Testproject")

    create(:project_member, project: project, membership_type: "participant")
    create(:project_member, project: project, membership_type: "admin")
    create(:project_member, project: project, membership_type: "participant")
    create(:project_member, project: project, membership_type: "admin")

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")

    expect(project.id).not_to eq res[:project][:id]
    expect(Project.find(res[:project][:id]).project_members.count).to eq 0
    expect(Project.count).to eq 2

    #1 Guest, 1 Creator, 4 User
    expect(User.count).to eq 6
  end

  it "delete one member" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator, slug: "Testproject")

    create(:project_member, project: project, membership_type: "participant")

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")

    expect(Project.find(project.id).user).not_to eq Project.find(res[:project][:id]).user
    expect(Project.find(res[:project][:id]).project_members.count).to eq 0
    expect(Project.count).to eq 2

    #1 Guest, 1 Creator, 1 User
    expect(User.count).to eq 3
  end

  it "copy the public state of a project" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator, slug: "Testproject", public: true)

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")

    expect(project.id).not_to eq res[:project][:id]
    expect(Project.find(res[:project][:id]).public).to eq true
    expect(res[:project][:public]).to eq true
  end

  it "copied one code_resources" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)
    code_resource = create(:code_resource, project: project)

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")

    expect(BlockLanguage.count).to eq 1
    expect(Grammar.count).to eq 1

    expect(res[:project][:id]).not_to eq project.id
    expect(res[:project][:slug]).to eq "tester"
    expect(res[:project][:public]).to eq false
    expect(res[:project][:name]).to eq project.name
    expect(res[:project][:description]).to eq project.description

    expect(Project.find(project.id).code_resources.first).to eq code_resource
    expect(Project.find(res[:project][:id]).code_resources.first).not_to eq code_resource

    expect(Project.find(project.id).code_resources.first.ast).to eq Project.find(res[:project][:id]).code_resources.first.ast
    expect(Project.find(project.id).code_resources.first.name).to eq Project.find(res[:project][:id]).code_resources.first.name
    expect(Project.find(project.id).code_resources.first.compiled).to eq Project.find(res[:project][:id]).code_resources.first.compiled
    expect(Project.find(project.id).code_resources.first.block_language_id).to eq Project.find(res[:project][:id]).code_resources.first.block_language_id

    expect(Project.count).to eq 2
    expect(CodeResource.count).to eq 2
    expect(BlockLanguage.count).to eq 1
    expect(Grammar.count).to eq 1
  end

  it "copied more code_resources" do

    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)
    code_resource1 = create(:code_resource, project: project, name:"1")
    code_resource2 = create(:code_resource, project: project, name:"2")
    code_resource3 = create(:code_resource, project: project, name:"3")

    expect(BlockLanguage.count).to eq 3
    expect(Grammar.count).to eq 3
    expect(ProjectUsesBlockLanguage.count).to eq 3

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")
    
    expect(res[:project][:id]).not_to eq project.id
    expect(res[:project][:slug]).to eq "tester"
    expect(res[:project][:public]).to eq false
    expect(res[:project][:name]).to eq project.name
    expect(res[:project][:description]).to eq project.description


    expect(Project.find(project.id).code_resources.find_by(name: "1").ast).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").ast
    expect(Project.find(project.id).code_resources.find_by(name: "1").name).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").name
    expect(Project.find(project.id).code_resources.find_by(name: "1").compiled).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").compiled
    expect(Project.find(project.id).code_resources.find_by(name: "1").block_language_id).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").block_language_id

    expect(Project.find(project.id).code_resources.find_by(name: "2").ast).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").ast
    expect(Project.find(project.id).code_resources.find_by(name: "2").name).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").name
    expect(Project.find(project.id).code_resources.find_by(name: "2").compiled).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").compiled
    expect(Project.find(project.id).code_resources.find_by(name: "2").block_language_id).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").block_language_id

    expect(Project.find(project.id).code_resources.find_by(name: "3").ast).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").ast
    expect(Project.find(project.id).code_resources.find_by(name: "3").name).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").name
    expect(Project.find(project.id).code_resources.find_by(name: "3").compiled).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").compiled
    expect(Project.find(project.id).code_resources.find_by(name: "3").block_language_id).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").block_language_id


    expect(Project.count).to eq 2

    expect(CodeResource.count).to eq 6
    expect(BlockLanguage.count).to eq 3
    expect(Grammar.count).to eq 3
    expect(ProjectUsesBlockLanguage.count).to eq 6
  end

  it "copied one project_source" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)
    project_source1 = create(:project_source, project: project, title:"1")

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")
    
    expect(res[:project][:id]).not_to eq project.id
    expect(res[:project][:slug]).to eq "tester"
    expect(res[:project][:public]).to eq false
    expect(res[:project][:name]).to eq project.name
    expect(res[:project][:description]).to eq project.description


    expect(Project.find(project.id).project_sources.find_by(title: "1").url).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").url
    expect(Project.find(project.id).project_sources.find_by(title: "1").display).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").display
    expect(Project.find(project.id).project_sources.find_by(title: "1").read_only).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").read_only


    expect(Project.count).to eq 2
    expect(ProjectSource.count).to eq 2
  end

  it "copied more project_sources" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)
    project_source1 = create(:project_source, project: project, title:"1")
    project_source1 = create(:project_source, project: project, title:"2")
    project_source1 = create(:project_source, project: project, title:"3")

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")
    
    expect(res[:project][:id]).not_to eq project.id
    expect(res[:project][:slug]).to eq "tester"
    expect(res[:project][:public]).to eq false
    expect(res[:project][:name]).to eq project.name
    expect(res[:project][:description]).to eq project.description


    expect(Project.find(project.id).project_sources.find_by(title: "1").url).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").url
    expect(Project.find(project.id).project_sources.find_by(title: "1").display).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").display
    expect(Project.find(project.id).project_sources.find_by(title: "1").read_only).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").read_only

    expect(Project.find(project.id).project_sources.find_by(title: "2").url).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "2").url
    expect(Project.find(project.id).project_sources.find_by(title: "2").display).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "2").display
    expect(Project.find(project.id).project_sources.find_by(title: "2").read_only).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "2").read_only

    expect(Project.find(project.id).project_sources.find_by(title: "3").url).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "3").url
    expect(Project.find(project.id).project_sources.find_by(title: "3").display).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "3").display
    expect(Project.find(project.id).project_sources.find_by(title: "3").read_only).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "3").read_only

    expect(Project.count).to eq 2
    expect(ProjectSource.count).to eq 6
  end

  it "copied one project_databases" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    project_database = create(:project_database, project: project, name: "1")

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")
    
    expect(res[:project][:id]).not_to eq project.id
    expect(res[:project][:slug]).to eq "tester"
    expect(res[:project][:public]).to eq false
    expect(res[:project][:name]).to eq project.name
    expect(res[:project][:description]).to eq project.description

    expect(Project.find(project.id).project_databases.find_by(name: "1").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "1").schema

    expect(Project.count).to eq 2
    expect(ProjectDatabase.count).to eq 2

  end

  it "copied many project_databases" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    project_database = create(:project_database, project: project, name: "1")
    project_database = create(:project_database, project: project, name: "2")
    project_database = create(:project_database, project: project, name: "3")
    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")
    
    expect(res[:project][:id]).not_to eq project.id
    expect(res[:project][:slug]).to eq "tester"
    expect(res[:project][:public]).to eq false
    expect(res[:project][:name]).to eq project.name
    expect(res[:project][:description]).to eq project.description

    expect(Project.find(project.id).project_databases.find_by(name: "1").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "1").schema
    expect(Project.find(project.id).project_databases.find_by(name: "2").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "2").schema
    expect(Project.find(project.id).project_databases.find_by(name: "3").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "3").schema

    expect(Project.count).to eq 2
    expect(ProjectDatabase.count).to eq 6
    
  end

  it "have a default database" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    project_database1 = create(:project_database, project: project, name: "1")
    project_database2 = create(:project_database, project: project, name: "2")
    project_database3 = create(:project_database, project: project, name: "3")

    project.default_database = project_database2
    project.save!

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")
    
    expect(res[:project][:id]).not_to eq project.id
    expect(res[:project][:slug]).to eq "tester"
    expect(res[:project][:public]).to eq false
    expect(res[:project][:name]).to eq project.name
    expect(res[:project][:description]).to eq project.description

    expect(Project.find(project.id).project_databases.find_by(name: "1").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "1").schema
    expect(Project.find(project.id).project_databases.find_by(name: "2").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "2").schema
    expect(Project.find(project.id).project_databases.find_by(name: "3").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "3").schema

    expect(Project.find(project.id).default_database).not_to eq Project.find(res[:project][:id]).default_database
    expect(Project.find(project.id).default_database.schema).to eq Project.find(res[:project][:id]).default_database.schema

    expect(Project.find(res[:project][:id]).default_database).not_to eq nil

    expect(Project.count).to eq 2
    expect(ProjectDatabase.count).to eq 6
  end

  it "create a real deep copy of all" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    project_database1 = create(:project_database, project: project, name: "1")
    project_database2 = create(:project_database, project: project, name: "2")
    project_database3 = create(:project_database, project: project, name: "3")

    project_source1 = create(:project_source, project: project, title:"1")
    project_source1 = create(:project_source, project: project, title:"2")
    project_source1 = create(:project_source, project: project, title:"3")

    code_resource1 = create(:code_resource, project: project, name:"1")
    code_resource2 = create(:code_resource, project: project, name:"2")
    code_resource3 = create(:code_resource, project: project, name:"3")

    project.default_database = project_database2
    project.save!

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "tester")
    
    expect(res[:project][:id]).not_to eq project.id
    expect(res[:project][:slug]).to eq "tester"
    expect(res[:project][:public]).to eq false
    expect(res[:project][:name]).to eq project.name
    expect(res[:project][:description]).to eq project.description

    expect(Project.find(project.id).project_databases.find_by(name: "1").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "1").schema
    expect(Project.find(project.id).project_databases.find_by(name: "2").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "2").schema
    expect(Project.find(project.id).project_databases.find_by(name: "3").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "3").schema

    expect(Project.find(project.id).default_database).not_to eq Project.find(res[:project][:id]).default_database
    expect(Project.find(project.id).default_database.schema).to eq Project.find(res[:project][:id]).default_database.schema

    expect(Project.find(res[:project][:id]).default_database).not_to eq nil

    expect(Project.find(project.id).project_sources.find_by(title: "1").url).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").url
    expect(Project.find(project.id).project_sources.find_by(title: "1").display).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").display
    expect(Project.find(project.id).project_sources.find_by(title: "1").read_only).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").read_only

    expect(Project.find(project.id).project_sources.find_by(title: "2").url).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "2").url
    expect(Project.find(project.id).project_sources.find_by(title: "2").display).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "2").display
    expect(Project.find(project.id).project_sources.find_by(title: "2").read_only).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "2").read_only

    expect(Project.find(project.id).project_sources.find_by(title: "3").url).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "3").url
    expect(Project.find(project.id).project_sources.find_by(title: "3").display).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "3").display
    expect(Project.find(project.id).project_sources.find_by(title: "3").read_only).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "3").read_only


    expect(Project.find(project.id).code_resources.find_by(name: "1").ast).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").ast
    expect(Project.find(project.id).code_resources.find_by(name: "1").name).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").name
    expect(Project.find(project.id).code_resources.find_by(name: "1").compiled).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").compiled
    expect(Project.find(project.id).code_resources.find_by(name: "1").block_language_id).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").block_language_id

    expect(Project.find(project.id).code_resources.find_by(name: "2").ast).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").ast
    expect(Project.find(project.id).code_resources.find_by(name: "2").name).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").name
    expect(Project.find(project.id).code_resources.find_by(name: "2").compiled).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").compiled
    expect(Project.find(project.id).code_resources.find_by(name: "2").block_language_id).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").block_language_id

    expect(Project.find(project.id).code_resources.find_by(name: "3").ast).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").ast
    expect(Project.find(project.id).code_resources.find_by(name: "3").name).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").name
    expect(Project.find(project.id).code_resources.find_by(name: "3").compiled).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").compiled
    expect(Project.find(project.id).code_resources.find_by(name: "3").block_language_id).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").block_language_id


    expect(CodeResource.count).to eq 6
    expect(BlockLanguage.count).to eq 3
    expect(Grammar.count).to eq 3
    expect(ProjectUsesBlockLanguage.count).to eq 6

    expect(Project.count).to eq 2
    expect(ProjectDatabase.count).to eq 6
    expect(ProjectSource.count).to eq 6
  end

  it "create a real deep copy of all with problems at default_databases" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    project_database1 = create(:project_database, project: project, name: "1")
    project_database2 = create(:project_database, project: project, name: "2")
    project_database3 = create(:project_database, project: project, name: "3")

    project_source1 = create(:project_source, project: project, title:"1")
    project_source2 = create(:project_source, project: project, title:"2")
    project_source3 = create(:project_source, project: project, title:"3")

    code_resource1 = create(:code_resource, project: project, name:"1")
    code_resource2 = create(:code_resource, project: project, name:"2")
    code_resource3 = create(:code_resource, project: project, name:"3")

    project.default_database = project_database2
    project.save!

    mut = described_class.new(**init_args())

    allow(project).to receive(:default_database).and_raise("boom")
    expect { mut.createDeepCopy(project,"tester")}.to raise_error(RuntimeError)

    expect(CodeResource.count).to eq 3
    expect(BlockLanguage.count).to eq 3
    expect(Grammar.count).to eq 3


    expect(Project.count).to eq 1
    expect(ProjectDatabase.count).to eq 3
    expect(ProjectSource.count).to eq 3
  end

  it "create a real deep copy of all with problems at project_sources" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    project_database1 = create(:project_database, project: project, name: "1")
    project_database2 = create(:project_database, project: project, name: "2")
    project_database3 = create(:project_database, project: project, name: "3")

    project_source1 = create(:project_source, project: project, title:"1")
    project_source2 = create(:project_source, project: project, title:"2")
    project_source3 = create(:project_source, project: project, title:"3")

    code_resource1 = create(:code_resource, project: project, name:"1")
    code_resource2 = create(:code_resource, project: project, name:"2")
    code_resource3 = create(:code_resource, project: project, name:"3")

    project.default_database = project_database2
    project.save!

    mut = described_class.new(**init_args())

    allow(project).to receive(:project_sources).and_raise("boom")

    expect { mut.createDeepCopy(project,"tester")}.to raise_error(RuntimeError)

    expect(CodeResource.count).to eq 3
    expect(BlockLanguage.count).to eq 3
    expect(Grammar.count).to eq 3

    expect(Project.count).to eq 1
    expect(ProjectDatabase.count).to eq 3
    expect(ProjectSource.count).to eq 3
  end

  it "create a real deep copy of all with problems at code_resources" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    project_database1 = create(:project_database, project: project, name: "1")
    project_database2 = create(:project_database, project: project, name: "2")
    project_database3 = create(:project_database, project: project, name: "3")

    project_source1 = create(:project_source, project: project, title:"1")
    project_source2 = create(:project_source, project: project, title:"2")
    project_source3 = create(:project_source, project: project, title:"3")

    code_resource1 = create(:code_resource, project: project, name:"1")
    code_resource2 = create(:code_resource, project: project, name:"2")
    code_resource3 = create(:code_resource, project: project, name:"3")

    project.default_database = project_database2
    project.save!

    mut = described_class.new(**init_args())

    allow(project).to receive(:code_resources).and_raise("boom")

    expect { mut.createDeepCopy(project,"tester")}.to raise_error(RuntimeError)

    expect(CodeResource.count).to eq 3
    expect(BlockLanguage.count).to eq 3
    expect(Grammar.count).to eq 3

    expect(Project.count).to eq 1
    expect(ProjectDatabase.count).to eq 3
    expect(ProjectSource.count).to eq 3
  end

  it "create a real deep copy of all with problems at default_database" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    project_database1 = create(:project_database, project: project, name: "1")
    project_database2 = create(:project_database, project: project, name: "2")
    project_database3 = create(:project_database, project: project, name: "3")

    project_source1 = create(:project_source, project: project, title:"1")
    project_source2 = create(:project_source, project: project, title:"2")
    project_source3 = create(:project_source, project: project, title:"3")

    code_resource1 = create(:code_resource, project: project, name:"1")
    code_resource2 = create(:code_resource, project: project, name:"2")
    code_resource3 = create(:code_resource, project: project, name:"3")

    project.default_database = project_database2
    project.save!

    mut = described_class.new(**init_args())

    allow(project).to receive(:default_database).and_raise("boom")

    expect { mut.createDeepCopy(project,"tester")}.to raise_error(RuntimeError)

    expect(CodeResource.count).to eq 3
    expect(BlockLanguage.count).to eq 3
    expect(Grammar.count).to eq 3
    expect(ProjectUsesBlockLanguage.count).to eq 3

    expect(Project.count).to eq 1
    expect(ProjectDatabase.count).to eq 3
    expect(ProjectSource.count).to eq 3
  end


  it "create a real deep copy of all with nil slug" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    project_database1 = create(:project_database, project: project, name: "1")
    project_database2 = create(:project_database, project: project, name: "2")
    project_database3 = create(:project_database, project: project, name: "3")

    project_source1 = create(:project_source, project: project, title:"1")
    project_source1 = create(:project_source, project: project, title:"2")
    project_source1 = create(:project_source, project: project, title:"3")

    code_resource1 = create(:code_resource, project: project, name:"1")
    code_resource2 = create(:code_resource, project: project, name:"2")
    code_resource3 = create(:code_resource, project: project, name:"3")

    project.default_database = project_database2
    project.save!

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id)

    expect(res[:project][:id]).not_to eq project.id
    expect(res[:project][:slug]).to eq nil
    expect(res[:project][:public]).to eq false
    expect(res[:project][:name]).to eq project.name
    expect(res[:project][:description]).to eq project.description

    expect(Project.find(project.id).project_databases.find_by(name: "1").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "1").schema
    expect(Project.find(project.id).project_databases.find_by(name: "2").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "2").schema
    expect(Project.find(project.id).project_databases.find_by(name: "3").schema).to eq Project.find(res[:project][:id]).project_databases.find_by(name: "3").schema

    expect(Project.find(project.id).default_database).not_to eq Project.find(res[:project][:id]).default_database
    expect(Project.find(project.id).default_database.schema).to eq Project.find(res[:project][:id]).default_database.schema

    expect(Project.find(res[:project][:id]).default_database).not_to eq nil

    expect(Project.find(project.id).project_sources.find_by(title: "1").url).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").url
    expect(Project.find(project.id).project_sources.find_by(title: "1").display).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").display
    expect(Project.find(project.id).project_sources.find_by(title: "1").read_only).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "1").read_only

    expect(Project.find(project.id).project_sources.find_by(title: "2").url).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "2").url
    expect(Project.find(project.id).project_sources.find_by(title: "2").display).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "2").display
    expect(Project.find(project.id).project_sources.find_by(title: "2").read_only).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "2").read_only

    expect(Project.find(project.id).project_sources.find_by(title: "3").url).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "3").url
    expect(Project.find(project.id).project_sources.find_by(title: "3").display).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "3").display
    expect(Project.find(project.id).project_sources.find_by(title: "3").read_only).to eq Project.find(res[:project][:id]).project_sources.find_by(title: "3").read_only


    expect(Project.find(project.id).code_resources.find_by(name: "1").ast).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").ast
    expect(Project.find(project.id).code_resources.find_by(name: "1").name).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").name
    expect(Project.find(project.id).code_resources.find_by(name: "1").compiled).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").compiled
    expect(Project.find(project.id).code_resources.find_by(name: "1").block_language_id).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "1").block_language_id

    expect(Project.find(project.id).code_resources.find_by(name: "2").ast).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").ast
    expect(Project.find(project.id).code_resources.find_by(name: "2").name).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").name
    expect(Project.find(project.id).code_resources.find_by(name: "2").compiled).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").compiled
    expect(Project.find(project.id).code_resources.find_by(name: "2").block_language_id).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "2").block_language_id

    expect(Project.find(project.id).code_resources.find_by(name: "3").ast).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").ast
    expect(Project.find(project.id).code_resources.find_by(name: "3").name).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").name
    expect(Project.find(project.id).code_resources.find_by(name: "3").compiled).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").compiled
    expect(Project.find(project.id).code_resources.find_by(name: "3").block_language_id).to eq Project.find(res[:project][:id]).code_resources.find_by(name: "3").block_language_id


    expect(CodeResource.count).to eq 6
    expect(BlockLanguage.count).to eq 3
    expect(Grammar.count).to eq 3

    expect(Project.count).to eq 2
    expect(ProjectDatabase.count).to eq 6
    expect(ProjectSource.count).to eq 6

  end 

  it "create a real deep copy of all with empty string of slug" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id, new_slug: "") 

    expect(Project.find(res[:project][:id]).slug).to eq nil
    expect(Project.find(res[:project][:id]).public).to eq false
    expect(Project.find(res[:project][:id]).name).to eq project.name
    expect(Project.find(res[:project][:id]).description).to eq project.description

    expect(Project.count).to eq 2
  end


  it "create a real deep copy with project_uses_block_languages" do
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    block_language1 = create(:project_uses_block_language, project: project)
    block_language2 = create(:project_uses_block_language, project: project)
    block_language3 = create(:project_uses_block_language, project: project)

    project.save!

    mut = described_class.new(**init_args())

    res = mut.resolve(project_id: project.id)


    expect(BlockLanguage.count).to eq 3
    expect(ProjectUsesBlockLanguage.count).to eq 6
    expect(Grammar.count).to eq 3

    expect(Project.count).to eq 2
  end

  xit "create a real deep copy with problems at project_uses_block_languages" do
    class MockProject < Project 
      
    end 
    creator = create(:user, display_name: "Creator")
    project = create(:project, user: creator)

    block_language1 = create(:project_uses_block_language, project: project)
    block_language2 = create(:project_uses_block_language, project: project)
    block_language3 = create(:project_uses_block_language, project: project)

    project = project.save!

    mut = described_class.new(**init_args())

    allow(project).to receive(:project_uses_block_languages).and_raise("boom")
    expect{mut.resolve(project_id: project.id)}.to raise_error(RuntimeError)


    expect(BlockLanguage.count).to eq 3
    expect(ProjectUsesBlockLanguage.count).to eq 3
    expect(Grammar.count).to eq 3

    expect(Project.count).to eq 1
  end


end