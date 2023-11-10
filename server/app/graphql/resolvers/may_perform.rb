# Checks whether a certain action may be performed by a certain user
class Resolvers::MayPerform
  class InvalidResourceTypeError < EsqulinoError::Base
    def initialize(raw_resource_type)
      super("resource_type #{raw_resource_type} is invalid", 400)
    end
  end

  class InvalidPolicyTypeError < EsqulinoError::Base
    def initialize(_rawresource_type)
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
    class_name = @raw_resource_type + 'Policy'
    begin
      class_name.constantize
    rescue NameError => e
      raise InvalidPolicyTypeError, class_name
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
      raise InvalidResourceTypeError, class_name unless class_instance < ApplicationRecord

      class_instance

    # Thrown by "constantize" if there is no such class
    rescue NameError => e
      raise InvalidResourceTypeError, class_name
    end
  end

  # Attempts to call the given policy_action on an instance
  # that has been constructed. It may happen that the instance
  # itself is valid, but for whatever reason does not provide
  # the method in question.
  def call_policy_action(policy_instance)
    action_method_name = (@raw_policy_action + '?').to_sym

    raise InvalidPolicyActionError.new(@raw_resource_type, @raw_policy_action) unless policy_instance.respond_to? action_method_name

    policy_instance.send action_method_name
  end

  # Performs authorization for the arguments that have been provided
  # in the constructor.
  def call
    resource_instance = resource_class.find_by(id: @resource_id)
    policy_instance = policy_class.new(@current_user, resource_instance)

    {
      perform: call_policy_action(policy_instance)
    }
  end
end
