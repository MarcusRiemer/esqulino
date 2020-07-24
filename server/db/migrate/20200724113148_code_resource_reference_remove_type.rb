class CodeResourceReferenceRemoveType < ActiveRecord::Migration[6.0]
  def change
    remove_column(:code_resource_references, :reference_type, :integer, { default: 0 })
  end
end
