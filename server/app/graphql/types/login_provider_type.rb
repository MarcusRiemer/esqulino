module Types
  class Types::LoginProviderType < Types::Base::BaseObject
    field :name, String, null: false
    field :urlName, String, null: false
    field :icon, String, null: false
    field :color, String, null: false
  end
end