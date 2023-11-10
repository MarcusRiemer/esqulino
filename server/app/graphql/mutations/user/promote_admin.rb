class Mutations::User::PromoteAdmin < Mutations::BaseMutation
  argument :user_id, ID, required: true

  field :user, Types::UserType, null: false

  def resolve(user_id:)
    user = User.find(user_id)
    authorize user, :promote_admin?

    User.make_user_admin!(user_id)

    { user: }
  end
end
