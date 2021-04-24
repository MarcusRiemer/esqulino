# Checks whether a certain action may be performed by a certain user
class Resolvers::MayPerform

  class InvalidResourceTypeError < EsqulinoError::Base
    def initialize(raw_resource_type)
      super("resource_type #{raw_resource_type} is invalid", 400)
    end
  end

  class InvalidPolicyTypeError < EsqulinoError::Base
    def initialize(rawresource_type)
      super("resource_type #{raw_resource_type} has no policy", 500)
    end
  end

  class InvalidPolicyActionError < EsqulinoError::Base
    def initialize(raw_resource_type, raw_policy_action)
      super("resource_type #{raw_resource_type} has no policy action #{raw_policy_action}", 500)
    end
  end

  # Shortcut to receive the result or an expected error
  def self.check(context, input)
    instance = Resolvers::MayPerform.new context, input
    instance.call
  end

  def initialize(context, input)
    @current_user = context[:user]
    @raw_resource_type = input[:resource_type]
    @raw_policy_action = input[:policy_action]
    @resource_id = input[:resource_id]
  end

  # The pundit policy that should respond to the policy actions
  def policy_class
    class_name = @raw_resource_type + "Policy"
    begin
      class_instance = class_name.constantize

      return class_instance
    rescue NameError => e
      raise InvalidPolicyTypeError.new(class_name)
    end
  end

  # The rails model class that must be able to find the relevant
  # resources.
  def resource_class
    class_name = @raw_resource_type
    begin
      class_instance = class_name.constantize

      # Whatever we have here: It must be some kind of model class
      # that is specific to our application
      if not(class_instance < ApplicationRecord)
        raise InvalidResourceTypeError.new(class_name)
      end

      return class_instance

    # Thrown by "constantize" if there is no such class
    rescue NameError => e
      raise InvalidResourceTypeError.new(class_name)
    end
  end

  # Attempts to call the given policy_action on an instance
  # that has been constructed. It may happen that the instance
  # itself is valid, but for whatever reason does not provide
  # the method in question.
  def call_policy_action(policy_instance)
    action_method_name = (@raw_policy_action + "?").to_sym

    if policy_instance.respond_to? action_method_name
      policy_instance.send action_method_name
    else
      raise InvalidPolicyActionError.new(@raw_resource_type, @raw_policy_action)
    end
  end

  # Performs authorization for the arguments that have been provided
  # in the constructor.
  def call
    resource_instance = resource_class.find_by(id: @resource_id)
    policy_instance = policy_class.new(@current_user, resource_instance)

    return {
      perform: call_policy_action(policy_instance)
    }
  end
end