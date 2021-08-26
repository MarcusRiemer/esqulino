class Resolvers::BasedOnProjectResolver < GraphQL::Schema::Resolver
  def resolve
    user = context[:user]

    # if object.is_present?
    #     object.code_resources = object.code_resources.select { |resource| resource.assignment_template_code_resources.any { |template| template.reference_type == 'given_full' }
    #     return object
    # else
    #     return nil
    # end

    nil
  end
end
