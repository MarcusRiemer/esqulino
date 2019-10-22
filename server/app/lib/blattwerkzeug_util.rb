module BlattwerkzeugUtil
  # @return True if the given string is a valid UUID
  def self.string_is_uuid?(str)
    not /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/.match(str).nil?
  end
end
