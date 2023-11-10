class Types::Response::AffectedResource < Types::Base::BaseObject
  field :id, ID, null: false
  field :type, Types::Response::ResourceType, null: false
end
