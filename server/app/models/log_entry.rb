# Keeps track of noteable events that occured. "Noteable" are mainly things that
# are either security related or destructive.
#
# * Changes to users or identities
# * Mails that have been sent
#
# By default most operations are triggered by a user, therefore the user is an explicit
# part of the model. The "data" field allows theoretically arbitrary references, but those
# are not enforced (because the may be part of e.g. deletion events).
class LogEntry < ApplicationRecord
  # The user that has triggered this event
  belongs_to :user, optional: true

  # Log a new entry
  #
  # @param type [string] A broad type for the event
  # @param data [Hash] A free from hash to store
  # @param user [User] The user who caused the event
  def self.log!(event_type, data: Hash.new(), user: nil)
    entry = LogEntry.new(event_type: event_type, data: data, user: user)
    entry.save!
  end
end
