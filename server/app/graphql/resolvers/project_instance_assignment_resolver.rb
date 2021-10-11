class Resolvers::ProjectInstanceAssignmentResolver < GraphQL::Schema::Resolver
    def resolve()

      user = context[:user]

      #If the user is not a member, only tasks whose start date has already been reached should be displayed.
      #So that you can not work on the task beforehand

      #TODO: Here it could come to the firing of a query, because it must be checked whether the user is a member. 
      if object.is_already_in_project?(user)
        return object.assignments
      else
        now = DateTime.current()

        return object.assignments.select { |a| !a.start_date.present? || now >= a.start_date}
      end
    end
  end
  