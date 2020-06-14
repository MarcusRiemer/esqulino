module Types
class Types::BaseConnection < GraphQL::Types::Relay::BaseConnection
  field :total_count, Integer, null: false
  def total_count
    byebug
    object.items&.count
  end
end
end
