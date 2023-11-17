# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Resolvers::MayPerform do
  describe 'Project Creation (no resource required)' do
    let(:may_perform_input) do
      {
        resource_type: 'Project',
        policy_action: 'create'
      }
    end

    it 'as guest' do
      r = Resolvers::MayPerform.check(
        { user: create(:user, :guest) },
        may_perform_input
      )

      expect(r).to eq({ perform: false })
    end

    it 'as admin' do
      r = Resolvers::MayPerform.check(
        { user: create(:user, :admin) },
        may_perform_input
      )

      expect(r).to eq({ perform: true })
    end
  end

  describe 'Project Update (Project resource required)' do
    let(:project) do
      create(:project)
    end

    let(:may_perform_input) do
      {
        resource_type: 'Project',
        resource_id: project.id,
        policy_action: 'update'
      }
    end

    it 'as guest' do
      r = Resolvers::MayPerform.check(
        { user: create(:user, :guest) },
        may_perform_input
      )

      expect(r).to eq({ perform: false })
    end

    it 'as admin' do
      r = Resolvers::MayPerform.check(
        { user: create(:user, :admin) },
        may_perform_input
      )

      expect(r).to eq({ perform: true })
    end
  end

  describe 'Non existant resource_type' do
    let(:may_perform_input) do
      {
        resource_type: 'WillNeverExist',
        policy_action: 'create'
      }
    end

    it 'as guest' do
      expect do
        Resolvers::MayPerform.check(
          { user: create(:user, :guest) },
          may_perform_input
        )
      end.to raise_error Resolvers::MayPerform::InvalidResourceTypeError
    end

    it 'as admin' do
      expect do
        Resolvers::MayPerform.check(
          { user: create(:user, :admin) },
          may_perform_input
        )
      end.to raise_error Resolvers::MayPerform::InvalidResourceTypeError
    end
  end

  describe 'non-model resource_type' do
    let(:may_perform_input) do
      {
        resource_type: 'ApplicationPolicy',
        policy_action: 'create'
      }
    end

    it 'as guest' do
      expect do
        Resolvers::MayPerform.check(
          { user: create(:user, :guest) },
          may_perform_input
        )
      end.to raise_error Resolvers::MayPerform::InvalidResourceTypeError
    end

    it 'as admin' do
      expect do
        Resolvers::MayPerform.check(
          { user: create(:user, :admin) },
          may_perform_input
        )
      end.to raise_error Resolvers::MayPerform::InvalidResourceTypeError
    end
  end

  describe 'invalid action' do
    let(:may_perform_input) do
      {
        resource_type: 'Project',
        policy_action: 'willneverexist'
      }
    end

    it 'as guest' do
      expect do
        Resolvers::MayPerform.check(
          { user: create(:user, :guest) },
          may_perform_input
        )
      end.to raise_error Resolvers::MayPerform::InvalidPolicyActionError
    end

    it 'as admin' do
      expect do
        Resolvers::MayPerform.check(
          { user: create(:user, :admin) },
          may_perform_input
        )
      end.to raise_error Resolvers::MayPerform::InvalidPolicyActionError
    end
  end
end
