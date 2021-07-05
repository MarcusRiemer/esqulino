class Mutations::Projects::ChangeAssignment < Mutations::BaseMutation
    argument :id, ID, required: true
    argument :name, String, required: false
    argument :description, String, required: false
    argument :weight, Integer, required: false
    argument :start_date, GraphQL::Types::ISO8601DateTime, required: false
    argument :end_date, GraphQL::Types::ISO8601DateTime, required: false

    field :project, Types::ProjectType, null: true

    def resolve(**args)
      

      assignment = Assignment.find(args[:id])

      project = Project.find_by_slug_or_id! (assignment.project_id)

      authorize project, :create_update_assignment?
      
        start_date= args.key?(:start_date) ? args[:start_date]  : assignment.start_date
        end_date = args.key?(:end_date) ? args[:end_date]  : assignment.end_date

        

      if  start_date != nil && end_date != nil && (start_date >= end_date)
        
        raise ArgumentError.new "The end date must be higher than the start date"
      end

      assignment.assign_attributes(args)
      assignment.save!

      #assignment.update( name: name, description: description, start_date: start_date, end_date: end_date, weight: weight) 

        return ({
          project: project
        })
        end
end