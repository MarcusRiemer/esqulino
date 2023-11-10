class Resolvers::ProjectInstanceMemberResolver < GraphQL::Schema::Resolver
  def resolve
    user = context[:user]
    return [] if user.guest?

    object.project_members
  end
end
