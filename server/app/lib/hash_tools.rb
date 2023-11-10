module HashTools
  # Creates the union of all hashes that were given. Nil values are
  # treated as an empty hash.
  def self.union(*hashes)
    to_return = {}
    hashes
      .filter { |h| !h.nil? }
      .each { |h| to_return.merge! h }

    to_return
  end
end
