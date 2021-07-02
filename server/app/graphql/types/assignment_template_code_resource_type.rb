module Types
    class Types::AssignmentTemplateCodeResourceType < Types::Base::BaseObject
        field :code_resource, Types::CodeResourceType, null: false
        field :code_resource_id, ID, null: false
        
        field :assignment_required_code_resource, Types::AssignmentRequiredCodeResourceType, null: false
        field :assignment_required_code_resource_id, ID, null: false

        class ReferenceTypeEnum < Types::Base::BaseEnum
            value "given_partially"
            value "given_full"
        end
        
        field :reference_type, ReferenceTypeEnum, null: false

    end
end