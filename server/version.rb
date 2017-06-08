require 'net/http'
require 'uri'
require 'json'
require 'date'

# The API version of this server. Usually all projects that are served by this
# instance should have exactly this version set.
#
# If you need to migrate your data, check out the esqulino CLI.
ESQULINO_API_VERSION = 3

# Checks the locally deployed version against the version that is available
# at Bitbucket
#
# @return [Hash] Structure is
#                {
#                  :remote => { :hash => string, :date => date },
#                  :local => { :hash => string, :date => date }
#                }
def check_against_master_repo()
  bitbucket_api_endpoint = "https://bitbucket.org/api/2.0/repositories/marcusriemer/esqulino/refs/branches/master"
  request_uri = URI(bitbucket_api_endpoint)

  res = Net::HTTP.get_response(request_uri)
  res_json = JSON.parse(res.body)

  local_date = DateTime.parse (`git show -s --format=%ci HEAD`.strip)
  remote_date = DateTime.parse res_json["target"]["date"]
  
  to_return = {
    :remote => {
      :hash => res_json["target"]["hash"],
      :date => remote_date
    },
    :local => {
      :hash => `git rev-parse HEAD`.strip,
      :date => local_date
    }
  }

  most_recent = nil

  if (to_return[:local][:hash] == to_return[:remote][:hash]) then
    most_recent = :same
  elsif local_date > remote_date then
    most_recent = :local
  elsif local_date < remote_date then
    most_recent = :remote
  end

  to_return[:newest] = most_recent

  return (to_return)
end
