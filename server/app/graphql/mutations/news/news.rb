class Mutations::News::News < Mutations::BaseMutation
  include LocaleHelper
  include JsonSchemaHelper
  include UserHelper

  field :news, Types::NewsType, null: true
  field :id, ID, null: true
  field :errors, [String], null: false

  def save_news(news)
    if news.save
      {
          grammar: news.to_full_api_response,
          errors: []
      }
    else
      news.errors.full_messages.each do |err|
          ({
              type: "railsValidation",
              data: {
                  msg: err,
              }
          })
      end
      {
          grammar: nil,
          errors: news.errors.full_messages
      }
    end
  end

  def destroy_news(news)
    news.destroy
    {
        news: nil,
        errors: []
    }
  end

  # Ensures that the date of the request is a proper ruby object
  def ensure_request(schema_name, body_string)
    # Do the basic loading and checking
    data = super
    byebug
    # Turn the date-string into a proper date object
    published_from = data["published_from"]
    if published_from
      data["published_from"] = parse_date(published_from)
    end
      data
  end

  # Parses the given date, possibly throws an Error if the string
  # is not actually a valid date.
  def parse_date(date_str)
    Date.parse(date_str)
  rescue ArgumentError => e
    raise EsqulinoError::Base.new("Invalid date #{date_str}", 400)
  end

  # Appends current_user to a hash
  def append_current_user(hash)
    hash[:user] = current_user
    hash
  end

end


