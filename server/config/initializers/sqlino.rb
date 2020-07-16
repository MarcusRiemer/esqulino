# Setting up various paths as part of the configuration
Rails.application.config.to_prepare do
  config = Rails.application.config
  config.sqlino = Rails.application.config_for :sqlino

  # Turn client_dir and data_dir into absolute paths
  config.sqlino[:client_dir] = Rails.root.join(Rails.configuration.sqlino['client_dir'])
  config.sqlino[:data_dir] = Rails.root.join(Rails.configuration.sqlino['data_dir'])

  config.sqlino[:projects_dir] = config.sqlino[:data_dir].join 'projects'
end

# Ensuring that all relevant folders exist
Rails.application.config.after_initialize do
  projects_dir = Rails.application.config.sqlino[:projects_dir]

  # Ensure that there is a data directory available
  if not File.directory? projects_dir
    abort("Startup Error: Projects directory at \"#{projects_dir}\" must exist and be writeable")
  end
end

# Setting up the IDE service
Rails.application.config.after_initialize do
  Rails.logger.info "Configuring IDE Service ..."
  IdeService.instantiate

  IdeService::LogSubscriber.attach_to :ide_service

  wait_for_cli = ENV.fetch("WAIT_IDE_SERVICE", false).to_s.downcase == "true"

  if wait_for_cli
    Rails.logger.info "IDE service configured, testing availability ..."
    begin
      IdeService.instance.wait_cli_program_exists!

      if not IdeService.instance.ping!
        abort("Startup Error: IDE service did not respond")
      end
    rescue IdeServiceError => e
      puts "##### Exception of type #{e.class.name} #####"
      puts e.message
      abort("Startup Exception: See above")
    end
  else
    Rails.logger.info "IDE service configured, Skipping availability test ..."
  end
end