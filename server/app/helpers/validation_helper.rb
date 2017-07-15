# 
module ValidationHelper
  @@validator = Validator.new Rails.configuration.sqlino['schema_dir']

  def ensure_request(schema_name, body_string)
    @@validator.ensure_request schema_name, body_string
  end
end
