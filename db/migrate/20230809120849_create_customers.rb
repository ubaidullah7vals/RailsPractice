class CreateCustomers < ActiveRecord::Migration[6.1]
  def change
    create_table :customers do |t|
      t.string :first_name
      t.string :last_name
      t.string :title
      t.string :email
      t.integer :visits
      t.integer :orders_count
      t.integer :lock_versin

      t.timestamps
    end
  end
end
