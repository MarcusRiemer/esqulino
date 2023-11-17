# frozen_string_literal: true

class ValidLanguagesValidator < ActiveModel::EachValidator
  # Grab helper to get to know valid languages
  include LocaleHelper

  # Runs the actual validation against a concrete record.
  #
  # @param record The model that contains the document to be tested
  # @param attribute The name of the tested attribute
  # @param value The value of the tested attribute
  def validate_each(record, attribute, value)
    unwanted_languages = value.keys - LocaleHelper.allowed_languages

    return if unwanted_languages.empty?

    record.errors.add(attribute, messag: "Unwanted Languages: #{unwanted_languages}")
  end
end
