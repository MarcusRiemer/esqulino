# frozen_string_literal: true

# Programming languages currently need to be implemented in the client, as they
# contain "active" code to validate and emit the syntaxtrees. Therefore the model
# is quite empty for the moment.
#
# As these programming languages will (probably) be never extended by users via
# the frontend, the ID is currently a string. The only valid entries are meant to
# be implemented via the seed-file, there mustn't be any CRUD-operations.
class ProgrammingLanguage < ApplicationRecord
end
