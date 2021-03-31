class Types::MayPerformType < Types::Base::BaseObject
  field :perform, Boolean, null: false

  class InputType < Types::Base::BaseInputObject
    graphql_name 'MayPerformInputType'
    argument :resource_type, String, required: true
    argument :resource_id, ID, required: false
    argument :policy_action, String, required: true
  end
end
