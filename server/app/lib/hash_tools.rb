module HashTools
  # Creates the union of all hashes that were given. Nil values are
  # treated as an empty hash.
  def self.union(*hashes)
    to_return = Hash.new
    hashes
      .filter { |h| not h.nil? }
      .each { |h| to_return.merge! h }

    return to_return
  end
end