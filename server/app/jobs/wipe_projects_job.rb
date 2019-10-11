# Wipes all projects (and dependant resources) that are currently in the database
class WipeProjectsJob < ApplicationJob
  queue_as :default

  def perform(*args)
    # There is a circular dependency between "Project" and "Project Database" so
    # we need to temporarily disable referential integrity
    ActiveRecord::Base.connection.disable_referential_integrity do
      ApplicationRecord.transaction do
        CodeResource.destroy_all
        ProjectDatabase.destroy_all
        ProjectUsesBlockLanguage.destroy_all
        Project.destroy_all
      end
    end
  end
end
