class Resolvers::ProjectInstanceMemberResolver < GraphQL::Schema::Resolver
  def resolve()
    user = context[:user]
    if user.guest?
      return []
    else
      return object.project_members
    end
  end
end
