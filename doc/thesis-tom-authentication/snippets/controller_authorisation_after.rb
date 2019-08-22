# Update an existing project.
def update
	begin
		authorize current_project
		current_project.update project_update_params # Simple properties
		current_project.update project_used_block_languages_params # Used block languages

		render json: current_project.to_project_api_response
	rescue Pundit::NotAuthorizedError => e
		error_response("You need the permission")
	end
end
