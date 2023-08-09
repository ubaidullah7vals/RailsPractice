# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

# Create authors
Author.create([
  { first_name: 'J.K.', last_name: 'Rowling', title: "Author1" },
  { first_name: 'George', last_name: 'Orwell', title: "Author2" },
  # Add more authors here
])

# Create additional authors to reach a minimum of 10
8.times do |n|
  Author.create(first_name: "Author#{n+3}", last_name: "LastName#{n+3}", title: "Author#{n+3}")
end

# Create suppliers
Supplier.create([
  { name: 'Supplier A' },
  { name: 'Supplier B' },
  # Add more suppliers here
])

# Create additional suppliers to reach a minimum of 10
8.times do |n|
  Supplier.create(name: "Supplier#{n+3}")
end

# Create customers
Customer.create([
  { first_name: 'John', last_name: 'Doe', title: "Customer1" },
  { first_name: 'Jane', last_name: 'Smith', title: "Customer2" },
  # Add more customers here
])

# Create additional customers to reach a minimum of 10
8.times do |n|
  Customer.create(first_name: "Customer#{n+3}", last_name: "LastName#{n+3}", title: "Customer#{n+3}")
end

# Create books
Book.create([
  { title: 'Harry Potter and the Sorcerer\'s Stone', year_published: 1997, price: 19.99, out_of_print: false, author_id: 1, supplier_id: 1 },
  { title: '1984', year_published: 1949, price: 12.99, out_of_print: true, author_id: 2, supplier_id: 2 },
  # Add more books here
])

# Create additional books to reach a minimum of 10
8.times do |n|
  Book.create(title: "Book#{n+3}", year_published: 2000 + n, price: 9.99 + n, out_of_print: false, author_id: n+3, supplier_id: n+3)
end

# Create orders
Order.create([
  { status: :shipped, customer_id: 1 },
  { status: :complete, customer_id: 2 },
  # Add more orders here
])

# Create additional orders to reach a minimum of 10
8.times do |n|
  Order.create(status: :shipped, customer_id: n+3)
end

# Create reviews
Review.create([
  { title: 'Great Book', body: 'I loved this book!', rating: 5, state: :published, customer_id: 1, book_id: 1 },
  { title: 'Interesting Read', body: 'A thought-provoking novel.', rating: 4, state: :published, customer_id: 2, book_id: 2 },
  # Add more reviews here
])

# Create additional reviews to reach a minimum of 10
8.times do |n|
  Review.create(title: "Review#{n+3}", body: "This is review number #{n+3}", rating: 3, state: :published, customer_id: n+3, book_id: n+3)
end
