module Seed
  class Base
    BASE_SEED_DIRECTORY = Rails.configuration.sqlino["seed"]["data_dir"]
    
    # def seed_specific_data_directory(seed_name)
    #   File.join BASE_SEED_DIRECOTRY, seed_name
    # end

    # def seed_specific_file_directory(seed_id, dependent_seed_id)
      
    # end
  end
end