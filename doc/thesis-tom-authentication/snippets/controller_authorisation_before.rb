  # Update an existing project.
  def update
    ensure_write_access do
      current_project.update project_update_params # Simple properties
      current_project.update project_used_block_languages_params # Used block languages

      render json: current_project.to_project_api_response
    end
  end

