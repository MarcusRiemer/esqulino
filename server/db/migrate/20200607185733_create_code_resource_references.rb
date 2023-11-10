class CreateCodeResourceReferences < ActiveRecord::Migration[6.0]
  def change
    # Using a custom PostgreSQL enum sadly conflicts with the schema.rb
    #
    # reversible do |change|
    #   change.up do
    #     execute <<-SQL
    #       CREATE TYPE code_resource_reference_type AS ENUM ('generic', 'include_types', 'visualizes');
    #     SQL
    #   end
    #   change.down do
    #     execute <<-SQL
    #       DROP TYPE code_resource_reference_type;
    #     SQL
    #   end
    # end

    create_table :code_resource_references, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.references :origin,
                   type: :uuid,
                   index: true,
                   null: false,
                   foreign_key: { to_table: :code_resources }
      t.references :target,
                   type: :uuid,
                   index: true,
                   null: false,
                   foreign_key: { to_table: :code_resources }
      t.integer :reference_type,
                null: false
      t.timestamps
    end

    # Adding a reference twice is not allowed
    add_index :code_resource_references,
              %i[origin_id target_id],
              unique: true,
              name: 'code_resource_references_unique'

    create_table :grammar_references, id: :uuid, default: 'gen_random_uuid()' do |t|
      t.references :origin,
                   type: :uuid,
                   index: true,
                   null: false,
                   foreign_key: { to_table: :grammars }
      t.references :target,
                   type: :uuid,
                   index: true,
                   null: false,
                   foreign_key: { to_table: :grammars }
      t.integer :reference_type,
                null: false
      t.timestamps
    end

    # Adding a reference twice is not allowed
    add_index :grammar_references,
              %i[origin_id target_id],
              unique: true,
              name: 'grammar_references_unique'
  end
end
