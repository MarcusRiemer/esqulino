# frozen_string_literal: true

class MultilangStringPresentValidator < ActiveModel::EachValidator
  # Runs the actual validation against a concrete record.
  #
  # @param record The model that contains the document to be tested
  # @param attribute The name of the tested attribute
  # @param value The value of the tested attribute
  def validate_each(record, attribute, value)
    # Only check on values that exist
    return unless value && value.empty?

    record.errors.add(attribute, message: 'No language present at all')
  end
end
