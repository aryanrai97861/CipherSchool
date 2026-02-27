/**
 * Seed Script — populates PostgreSQL tables with sample data
 * and creates matching Assignment documents in MongoDB.
 *
 * Usage: node src/seed.js
 */
require('dotenv').config();
const { pgPool, connectMongo } = require('./config/db');
const Assignment = require('./models/Assignment');

async function seedPostgres(client) {
  console.log('📦 Creating PostgreSQL tables...');

  // ── employees table ───────────────────────────────────────
  await client.query(`
    DROP TABLE IF EXISTS order_items CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS products CASCADE;
    DROP TABLE IF EXISTS employees CASCADE;
    DROP TABLE IF EXISTS departments CASCADE;
  `);

  await client.query(`
    CREATE TABLE departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      location VARCHAR(100)
    );
  `);

  await client.query(`
    INSERT INTO departments (name, location) VALUES
    ('Engineering', 'Building A'),
    ('Marketing', 'Building B'),
    ('Sales', 'Building C'),
    ('HR', 'Building A'),
    ('Finance', 'Building D');
  `);

  await client.query(`
    CREATE TABLE employees (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE,
      department_id INT REFERENCES departments(id),
      salary DECIMAL(10, 2),
      hire_date DATE,
      is_active BOOLEAN DEFAULT true
    );
  `);

  await client.query(`
    INSERT INTO employees (first_name, last_name, email, department_id, salary, hire_date, is_active) VALUES
    ('Alice',   'Johnson',  'alice@company.com',    1, 95000.00, '2020-03-15', true),
    ('Bob',     'Smith',    'bob@company.com',      1, 88000.00, '2019-07-22', true),
    ('Charlie', 'Brown',    'charlie@company.com',  2, 72000.00, '2021-01-10', true),
    ('Diana',   'Prince',   'diana@company.com',    3, 67000.00, '2022-05-03', true),
    ('Eve',     'Davis',    'eve@company.com',      1, 102000.00,'2018-11-28', true),
    ('Frank',   'Miller',   'frank@company.com',    2, 69000.00, '2023-02-14', true),
    ('Grace',   'Lee',      'grace@company.com',    4, 78000.00, '2020-09-01', true),
    ('Hank',    'Wilson',   'hank@company.com',     3, 71000.00, '2021-06-18', false),
    ('Ivy',     'Chen',     'ivy@company.com',      5, 85000.00, '2019-04-07', true),
    ('Jack',    'Taylor',   'jack@company.com',     1, 92000.00, '2020-12-01', true),
    ('Karen',   'White',    'karen@company.com',    5, 91000.00, '2017-08-20', true),
    ('Leo',     'Martinez', 'leo@company.com',      3, 63000.00, '2023-07-12', true);
  `);

  // ── products table ────────────────────────────────────────
  await client.query(`
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(50),
      price DECIMAL(10, 2),
      stock INT DEFAULT 0
    );
  `);

  await client.query(`
    INSERT INTO products (name, category, price, stock) VALUES
    ('Laptop Pro 15',     'Electronics', 1299.99, 45),
    ('Wireless Mouse',    'Electronics', 29.99,   200),
    ('Office Chair',      'Furniture',   349.00,  30),
    ('Standing Desk',     'Furniture',   599.00,  15),
    ('Mechanical Keyboard','Electronics', 89.99,  120),
    ('Monitor 27"',       'Electronics', 449.99,  60),
    ('Desk Lamp',         'Accessories', 45.00,   80),
    ('Webcam HD',         'Electronics', 79.99,   95),
    ('Notebook Pack',     'Stationery',  12.99,   500),
    ('Whiteboard',        'Office',      129.00,  25);
  `);

  // ── orders table ──────────────────────────────────────────
  await client.query(`
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      order_date DATE NOT NULL,
      total_amount DECIMAL(10, 2),
      status VARCHAR(20) DEFAULT 'pending'
    );
  `);

  await client.query(`
    INSERT INTO orders (customer_name, order_date, total_amount, status) VALUES
    ('John Doe',      '2024-01-15', 1329.98, 'completed'),
    ('Jane Smith',    '2024-01-20', 698.00,  'completed'),
    ('Mike Johnson',  '2024-02-01', 89.99,   'shipped'),
    ('Sarah Williams','2024-02-10', 1749.98, 'completed'),
    ('Chris Brown',   '2024-02-14', 45.00,   'pending'),
    ('Emily Davis',   '2024-03-01', 529.98,  'shipped'),
    ('David Wilson',  '2024-03-05', 12.99,   'completed'),
    ('Lisa Anderson', '2024-03-10', 349.00,  'pending');
  `);

  await client.query(`
    CREATE TABLE order_items (
      id SERIAL PRIMARY KEY,
      order_id INT REFERENCES orders(id),
      product_id INT REFERENCES products(id),
      quantity INT NOT NULL,
      unit_price DECIMAL(10, 2) NOT NULL
    );
  `);

  await client.query(`
    INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
    (1, 1, 1, 1299.99), (1, 2, 1, 29.99),
    (2, 3, 1, 349.00),  (2, 4, 1, 349.00),
    (3, 5, 1, 89.99),
    (4, 1, 1, 1299.99), (4, 6, 1, 449.99),
    (5, 7, 1, 45.00),
    (6, 6, 1, 449.99),  (6, 8, 1, 79.99),
    (7, 9, 1, 12.99),
    (8, 3, 1, 349.00);
  `);

  console.log('✅ PostgreSQL tables seeded');
}

async function seedMongoDB() {
  console.log('📦 Creating MongoDB assignments...');

  await Assignment.deleteMany({});

  const assignments = [
    {
      title: 'Employee Directory Lookup',
      description: 'Query the employees table to find and filter employee records.',
      difficulty: 'Easy',
      question:
        'Write a SQL query to retrieve the first name, last name, and salary of all active employees in the Engineering department. Sort them by salary in descending order.',
      sampleTables: [
        {
          tableName: 'employees',
          columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'first_name', type: 'VARCHAR(50)' },
            { name: 'last_name', type: 'VARCHAR(50)' },
            { name: 'email', type: 'VARCHAR(100)' },
            { name: 'department_id', type: 'INT (FK → departments.id)' },
            { name: 'salary', type: 'DECIMAL(10,2)' },
            { name: 'hire_date', type: 'DATE' },
            { name: 'is_active', type: 'BOOLEAN' },
          ],
          sampleRows: [
            [1, 'Alice', 'Johnson', 'alice@company.com', 1, 95000.0, '2020-03-15', true],
            [2, 'Bob', 'Smith', 'bob@company.com', 1, 88000.0, '2019-07-22', true],
            [3, 'Charlie', 'Brown', 'charlie@company.com', 2, 72000.0, '2021-01-10', true],
          ],
        },
        {
          tableName: 'departments',
          columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'location', type: 'VARCHAR(100)' },
          ],
          sampleRows: [
            [1, 'Engineering', 'Building A'],
            [2, 'Marketing', 'Building B'],
            [3, 'Sales', 'Building C'],
          ],
        },
      ],
      sandboxTableNames: ['employees', 'departments'],
      expectedOutputHint: 'Should return 4 rows with Engineering employees sorted by salary (highest first).',
    },
    {
      title: 'Department Salary Statistics',
      description: 'Use aggregate functions to analyze salary data across departments.',
      difficulty: 'Medium',
      question:
        'Write a SQL query that shows each department name along with the number of employees, average salary (rounded to 2 decimals), and maximum salary. Only include departments with more than 1 employee.',
      sampleTables: [
        {
          tableName: 'employees',
          columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'first_name', type: 'VARCHAR(50)' },
            { name: 'last_name', type: 'VARCHAR(50)' },
            { name: 'email', type: 'VARCHAR(100)' },
            { name: 'department_id', type: 'INT (FK → departments.id)' },
            { name: 'salary', type: 'DECIMAL(10,2)' },
            { name: 'hire_date', type: 'DATE' },
            { name: 'is_active', type: 'BOOLEAN' },
          ],
          sampleRows: [
            [1, 'Alice', 'Johnson', 'alice@company.com', 1, 95000.0, '2020-03-15', true],
            [2, 'Bob', 'Smith', 'bob@company.com', 1, 88000.0, '2019-07-22', true],
          ],
        },
        {
          tableName: 'departments',
          columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'location', type: 'VARCHAR(100)' },
          ],
          sampleRows: [
            [1, 'Engineering', 'Building A'],
            [2, 'Marketing', 'Building B'],
          ],
        },
      ],
      sandboxTableNames: ['employees', 'departments'],
      expectedOutputHint: 'Should include Engineering, Marketing, Sales. Use JOIN, GROUP BY, and HAVING.',
    },
    {
      title: 'Product Inventory Check',
      description: 'Query the products table to analyze inventory levels.',
      difficulty: 'Easy',
      question:
        'Write a SQL query to find all products in the "Electronics" category with stock greater than 50. Display the product name, price, and stock, sorted by price ascending.',
      sampleTables: [
        {
          tableName: 'products',
          columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'category', type: 'VARCHAR(50)' },
            { name: 'price', type: 'DECIMAL(10,2)' },
            { name: 'stock', type: 'INT' },
          ],
          sampleRows: [
            [1, 'Laptop Pro 15', 'Electronics', 1299.99, 45],
            [2, 'Wireless Mouse', 'Electronics', 29.99, 200],
            [3, 'Office Chair', 'Furniture', 349.0, 30],
          ],
        },
      ],
      sandboxTableNames: ['products'],
      expectedOutputHint: 'Should return electronics products with stock > 50, ordered by price.',
    },
    {
      title: 'Order Analysis with Joins',
      description: 'Use JOIN operations to combine order and product data.',
      difficulty: 'Medium',
      question:
        'Write a SQL query to list all completed orders showing the customer name, order date, product name, quantity, and the line total (quantity × unit_price). Sort by order date.',
      sampleTables: [
        {
          tableName: 'orders',
          columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'customer_name', type: 'VARCHAR(100)' },
            { name: 'order_date', type: 'DATE' },
            { name: 'total_amount', type: 'DECIMAL(10,2)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ],
          sampleRows: [
            [1, 'John Doe', '2024-01-15', 1329.98, 'completed'],
            [2, 'Jane Smith', '2024-01-20', 698.0, 'completed'],
          ],
        },
        {
          tableName: 'order_items',
          columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'order_id', type: 'INT (FK → orders.id)' },
            { name: 'product_id', type: 'INT (FK → products.id)' },
            { name: 'quantity', type: 'INT' },
            { name: 'unit_price', type: 'DECIMAL(10,2)' },
          ],
          sampleRows: [
            [1, 1, 1, 1, 1299.99],
            [2, 1, 2, 1, 29.99],
          ],
        },
        {
          tableName: 'products',
          columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'category', type: 'VARCHAR(50)' },
            { name: 'price', type: 'DECIMAL(10,2)' },
            { name: 'stock', type: 'INT' },
          ],
          sampleRows: [
            [1, 'Laptop Pro 15', 'Electronics', 1299.99, 45],
            [2, 'Wireless Mouse', 'Electronics', 29.99, 200],
          ],
        },
      ],
      sandboxTableNames: ['orders', 'order_items', 'products'],
      expectedOutputHint: 'Use JOIN on orders ↔ order_items ↔ products. Filter status = completed.',
    },
    {
      title: 'Top Spending Customers',
      description: 'Use subqueries and aggregation to find top customers.',
      difficulty: 'Hard',
      question:
        'Write a SQL query to find the top 3 customers by total spending across all their completed orders. Show the customer name, total number of orders, and total amount spent. Only include customers who have placed more than 1 order.',
      sampleTables: [
        {
          tableName: 'orders',
          columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'customer_name', type: 'VARCHAR(100)' },
            { name: 'order_date', type: 'DATE' },
            { name: 'total_amount', type: 'DECIMAL(10,2)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ],
          sampleRows: [
            [1, 'John Doe', '2024-01-15', 1329.98, 'completed'],
            [4, 'Sarah Williams', '2024-02-10', 1749.98, 'completed'],
            [7, 'David Wilson', '2024-03-05', 12.99, 'completed'],
          ],
        },
      ],
      sandboxTableNames: ['orders'],
      expectedOutputHint: 'Use GROUP BY customer_name, HAVING, ORDER BY, and LIMIT.',
    },
    {
      title: 'Employee Hire Trends',
      description: 'Analyze hiring patterns using date functions and grouping.',
      difficulty: 'Hard',
      question:
        'Write a SQL query that shows the number of employees hired per year, along with the average salary of employees hired that year (rounded to nearest integer). Include only years where at least 2 people were hired. Sort by year descending.',
      sampleTables: [
        {
          tableName: 'employees',
          columns: [
            { name: 'id', type: 'SERIAL PRIMARY KEY' },
            { name: 'first_name', type: 'VARCHAR(50)' },
            { name: 'last_name', type: 'VARCHAR(50)' },
            { name: 'email', type: 'VARCHAR(100)' },
            { name: 'department_id', type: 'INT (FK → departments.id)' },
            { name: 'salary', type: 'DECIMAL(10,2)' },
            { name: 'hire_date', type: 'DATE' },
            { name: 'is_active', type: 'BOOLEAN' },
          ],
          sampleRows: [
            [1, 'Alice', 'Johnson', 'alice@company.com', 1, 95000.0, '2020-03-15', true],
            [7, 'Grace', 'Lee', 'grace@company.com', 4, 78000.0, '2020-09-01', true],
            [10, 'Jack', 'Taylor', 'jack@company.com', 1, 92000.0, '2020-12-01', true],
          ],
        },
      ],
      sandboxTableNames: ['employees'],
      expectedOutputHint: 'Use EXTRACT(YEAR FROM hire_date) to group. Apply HAVING for the filter.',
    },
  ];

  await Assignment.insertMany(assignments);
  console.log(`✅ Created ${assignments.length} assignments in MongoDB`);
}

async function seed() {
  await connectMongo();

  const client = await pgPool.connect();
  try {
    await seedPostgres(client);
    await seedMongoDB();
    console.log('\n🎉 Seed complete!\n');
  } catch (err) {
    console.error('❌ Seed failed:', err);
  } finally {
    client.release();
    await pgPool.end();
    process.exit(0);
  }
}

seed();
