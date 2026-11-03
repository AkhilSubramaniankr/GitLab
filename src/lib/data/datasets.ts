// Shared sample datasets for use across multiple labs and modules.
// All data is synthetic — clearly identified as such in the UI.

import type { Table } from '@/components/labs/sql-lab'

export interface RetailRow {
  order_id: number
  order_date: string
  customer_id: string
  product: string
  category: string
  region: string
  quantity: number
  unit_price: number
  revenue: number
  cost: number
  profit: number
}

export const retailSales: RetailRow[] = [
  { order_id: 1001, order_date: '2024-01-05', customer_id: 'C001', product: 'Wireless Mouse', category: 'Electronics', region: 'West', quantity: 2, unit_price: 25.99, revenue: 51.98, cost: 30.00, profit: 21.98 },
  { order_id: 1002, order_date: '2024-01-07', customer_id: 'C002', product: 'Office Chair', category: 'Furniture', region: 'East', quantity: 1, unit_price: 149.99, revenue: 149.99, cost: 95.00, profit: 54.99 },
  { order_id: 1003, order_date: '2024-01-08', customer_id: 'C003', product: 'Notebook', category: 'Stationery', region: 'North', quantity: 5, unit_price: 4.50, revenue: 22.50, cost: 12.00, profit: 10.50 },
  { order_id: 1004, order_date: '2024-01-12', customer_id: 'C001', product: 'USB-C Cable', category: 'Electronics', region: 'West', quantity: 3, unit_price: 9.99, revenue: 29.97, cost: 15.00, profit: 14.97 },
  { order_id: 1005, order_date: '2024-01-15', customer_id: 'C004', product: 'Desk Lamp', category: 'Furniture', region: 'South', quantity: 2, unit_price: 32.00, revenue: 64.00, cost: 38.00, profit: 26.00 },
  { order_id: 1006, order_date: '2024-01-18', customer_id: 'C002', product: 'Wireless Mouse', category: 'Electronics', region: 'East', quantity: 1, unit_price: 25.99, revenue: 25.99, cost: 15.00, profit: 10.99 },
  { order_id: 1007, order_date: '2024-01-22', customer_id: 'C005', product: 'Coffee Mug', category: 'Kitchen', region: 'West', quantity: 4, unit_price: 8.50, revenue: 34.00, cost: 18.00, profit: 16.00 },
  { order_id: 1008, order_date: '2024-01-25', customer_id: 'C003', product: 'Office Chair', category: 'Furniture', region: 'North', quantity: 1, unit_price: 149.99, revenue: 149.99, cost: 95.00, profit: 54.99 },
  { order_id: 1009, order_date: '2024-02-02', customer_id: 'C006', product: 'Notebook', category: 'Stationery', region: 'East', quantity: 10, unit_price: 4.50, revenue: 45.00, cost: 24.00, profit: 21.00 },
  { order_id: 1010, order_date: '2024-02-05', customer_id: 'C001', product: 'USB-C Cable', category: 'Electronics', region: 'West', quantity: 2, unit_price: 9.99, revenue: 19.98, cost: 10.00, profit: 9.98 },
  { order_id: 1011, order_date: '2024-02-08', customer_id: 'C007', product: 'Desk Lamp', category: 'Furniture', region: 'South', quantity: 3, unit_price: 32.00, revenue: 96.00, cost: 57.00, profit: 39.00 },
  { order_id: 1012, order_date: '2024-02-12', customer_id: 'C004', product: 'Coffee Mug', category: 'Kitchen', region: 'South', quantity: 6, unit_price: 8.50, revenue: 51.00, cost: 27.00, profit: 24.00 },
  { order_id: 1013, order_date: '2024-02-15', customer_id: 'C002', product: 'Wireless Mouse', category: 'Electronics', region: 'East', quantity: 2, unit_price: 25.99, revenue: 51.98, cost: 30.00, profit: 21.98 },
  { order_id: 1014, order_date: '2024-02-20', customer_id: 'C008', product: 'Office Chair', category: 'Furniture', region: 'North', quantity: 2, unit_price: 149.99, revenue: 299.98, cost: 190.00, profit: 109.98 },
  { order_id: 1015, order_date: '2024-02-25', customer_id: 'C005', product: 'Notebook', category: 'Stationery', region: 'West', quantity: 8, unit_price: 4.50, revenue: 36.00, cost: 19.20, profit: 16.80 },
  { order_id: 1016, order_date: '2024-03-03', customer_id: 'C006', product: 'USB-C Cable', category: 'Electronics', region: 'East', quantity: 5, unit_price: 9.99, revenue: 49.95, cost: 25.00, profit: 24.95 },
  { order_id: 1017, order_date: '2024-03-07', customer_id: 'C003', product: 'Coffee Mug', category: 'Kitchen', region: 'North', quantity: 3, unit_price: 8.50, revenue: 25.50, cost: 13.50, profit: 12.00 },
  { order_id: 1018, order_date: '2024-03-10', customer_id: 'C007', product: 'Desk Lamp', category: 'Furniture', region: 'South', quantity: 1, unit_price: 32.00, revenue: 32.00, cost: 19.00, profit: 13.00 },
  { order_id: 1019, order_date: '2024-03-14', customer_id: 'C001', product: 'Office Chair', category: 'Furniture', region: 'West', quantity: 1, unit_price: 149.99, revenue: 149.99, cost: 95.00, profit: 54.99 },
  { order_id: 1020, order_date: '2024-03-18', customer_id: 'C008', product: 'Wireless Mouse', category: 'Electronics', region: 'North', quantity: 4, unit_price: 25.99, revenue: 103.96, cost: 60.00, profit: 43.96 },
]

// Messy dataset for the Data Cleaning lab — has missing values, duplicates, inconsistent categories
export interface DirtyRetailRow {
  row_id: number
  order_id?: number | null
  order_date?: string | null
  customer_id?: string | null
  product?: string | null
  category?: string | null
  region?: string | null
  quantity?: number | null
  unit_price?: number | null
  revenue?: number | null
  cost?: number | null
  profit?: number | null
}

export const dirtyRetailSales: DirtyRetailRow[] = [
  { row_id: 1, order_id: 1001, order_date: '2024-01-05', customer_id: 'C001', product: 'Wireless Mouse', category: 'Electronics', region: 'west', quantity: 2, unit_price: 25.99, revenue: 51.98, cost: 30.00, profit: 21.98 },
  { row_id: 2, order_id: 1002, order_date: '2024-01-07', customer_id: 'C002', product: 'Office Chair', category: 'furniture', region: 'East', quantity: 1, unit_price: 149.99, revenue: 149.99, cost: 95.00, profit: 54.99 },
  { row_id: 3, order_id: 1003, order_date: '2024-01-08', customer_id: 'C003', product: 'Notebook', category: 'STATIONERY', region: 'North', quantity: 5, unit_price: 4.50, revenue: 22.50, cost: 12.00, profit: 10.50 },
  { row_id: 4, order_id: 1001, order_date: '2024-01-05', customer_id: 'C001', product: 'Wireless Mouse', category: 'Electronics', region: 'west', quantity: 2, unit_price: 25.99, revenue: 51.98, cost: 30.00, profit: 21.98 }, // duplicate
  { row_id: 5, order_id: 1004, order_date: '01/12/2024', customer_id: 'C001', product: 'USB-C Cable', category: 'Electronics', region: 'West', quantity: 3, unit_price: 9.99, revenue: 29.97, cost: 15.00, profit: 14.97 }, // wrong date format
  { row_id: 6, order_id: 1005, order_date: '2024-01-15', customer_id: null, product: 'Desk Lamp', category: 'Furniture', region: 'South', quantity: 2, unit_price: 32.00, revenue: 64.00, cost: 38.00, profit: 26.00 }, // missing customer_id
  { row_id: 7, order_id: 1006, order_date: '2024-01-18', customer_id: 'C002', product: null, category: 'Electronics', region: 'East', quantity: 1, unit_price: 25.99, revenue: 25.99, cost: 15.00, profit: 10.99 }, // missing product
  { row_id: 8, order_id: 1007, order_date: '2024-01-22', customer_id: 'C005', product: 'Coffee Mug', category: 'Kitchen', region: 'WEST', quantity: 4, unit_price: 8.50, revenue: 34.00, cost: 18.00, profit: 16.00 },
  { row_id: 9, order_id: 1008, order_date: '2024-01-25', customer_id: 'C003', product: 'Office Chair', category: 'furniture', region: 'North', quantity: 1, unit_price: 149.99, revenue: 149.99, cost: 95.00, profit: 54.99 },
  { row_id: 10, order_id: 1009, order_date: '2024-02-02', customer_id: 'C006', product: 'Notebook', category: 'stationery', region: 'east', quantity: 10, unit_price: 4.50, revenue: 45.00, cost: 24.00, profit: 21.00 },
  { row_id: 11, order_id: 1010, order_date: '2024-02-05', customer_id: 'C001', product: 'USB-C Cable', category: 'Electronics', region: 'West', quantity: -2, unit_price: 9.99, revenue: 19.98, cost: 10.00, profit: 9.98 }, // invalid negative quantity
  { row_id: 12, order_id: 1011, order_date: '2024-02-08', customer_id: 'C007', product: 'Desk Lamp', category: 'Furniture', region: 'South', quantity: 3, unit_price: 32.00, revenue: null, cost: 57.00, profit: 39.00 }, // missing revenue
  { row_id: 13, order_id: 1012, order_date: '2024-02-12', customer_id: 'C004', product: 'Coffee Mug', category: 'Kitchen', region: 'South', quantity: 6, unit_price: 8.50, revenue: 51.00, cost: 27.00, profit: 24.00 },
  { row_id: 14, order_id: 1002, order_date: '2024-01-07', customer_id: 'C002', product: 'Office Chair', category: 'furniture', region: 'East', quantity: 1, unit_price: 149.99, revenue: 149.99, cost: 95.00, profit: 54.99 }, // duplicate of row 2
  { row_id: 15, order_id: 1014, order_date: '2024-02-20', customer_id: 'C008', product: 'Office Chair', category: 'Furniture', region: 'North', quantity: 2, unit_price: 149.99, revenue: 299.98, cost: 190.00, profit: 109.98 },
]

// HR Analytics sample
export interface HRRow {
  employee_id: number
  department: string
  job_role: string
  age: number
  monthly_income: number
  years_at_company: number
  overtime: string
  attrition: string
}

export const hrAnalytics: HRRow[] = [
  { employee_id: 1, department: 'Sales', job_role: 'Sales Executive', age: 41, monthly_income: 5993, years_at_company: 6, overtime: 'Yes', attrition: 'Yes' },
  { employee_id: 2, department: 'Research & Development', job_role: 'Research Scientist', age: 49, monthly_income: 5130, years_at_company: 10, overtime: 'No', attrition: 'No' },
  { employee_id: 3, department: 'Research & Development', job_role: 'Research Scientist', age: 37, monthly_income: 2090, years_at_company: 7, overtime: 'Yes', attrition: 'Yes' },
  { employee_id: 4, department: 'Sales', job_role: 'Sales Executive', age: 33, monthly_income: 2909, years_at_company: 8, overtime: 'Yes', attrition: 'No' },
  { employee_id: 5, department: 'Research & Development', job_role: 'Laboratory Technician', age: 27, monthly_income: 3468, years_at_company: 6, overtime: 'No', attrition: 'No' },
  { employee_id: 6, department: 'Sales', job_role: 'Sales Representative', age: 32, monthly_income: 3068, years_at_company: 8, overtime: 'No', attrition: 'No' },
  { employee_id: 7, department: 'Sales', job_role: 'Sales Executive', age: 59, monthly_income: 2670, years_at_company: 12, overtime: 'No', attrition: 'No' },
  { employee_id: 8, department: 'Research & Development', job_role: 'Laboratory Technician', age: 30, monthly_income: 2693, years_at_company: 9, overtime: 'No', attrition: 'No' },
  { employee_id: 9, department: 'Human Resources', job_role: 'HR', age: 38, monthly_income: 9526, years_at_company: 7, overtime: 'No', attrition: 'No' },
  { employee_id: 10, department: 'Research & Development', job_role: 'Research Scientist', age: 36, monthly_income: 5237, years_at_company: 10, overtime: 'No', attrition: 'Yes' },
  { employee_id: 11, department: 'Sales', job_role: 'Sales Executive', age: 35, monthly_income: 2426, years_at_company: 8, overtime: 'No', attrition: 'No' },
  { employee_id: 12, department: 'Research & Development', job_role: 'Laboratory Technician', age: 29, monthly_income: 4250, years_at_company: 6, overtime: 'No', attrition: 'No' },
  { employee_id: 13, department: 'Sales', job_role: 'Sales Executive', age: 34, monthly_income: 9182, years_at_company: 9, overtime: 'Yes', attrition: 'No' },
  { employee_id: 14, department: 'Research & Development', job_role: 'Research Scientist', age: 28, monthly_income: 5255, years_at_company: 7, overtime: 'No', attrition: 'No' },
  { employee_id: 15, department: 'Research & Development', job_role: 'Manager', age: 52, monthly_income: 11759, years_at_company: 15, overtime: 'Yes', attrition: 'No' },
]

// SQL-ready versions of the tables
export const sqlTables: Record<string, Table> = {
  sales: {
    name: 'sales',
    columns: [
      { name: 'order_id', type: 'INT' },
      { name: 'order_date', type: 'DATE' },
      { name: 'customer_id', type: 'VARCHAR' },
      { name: 'product', type: 'VARCHAR' },
      { name: 'category', type: 'VARCHAR' },
      { name: 'region', type: 'VARCHAR' },
      { name: 'quantity', type: 'INT' },
      { name: 'unit_price', type: 'DECIMAL' },
      { name: 'revenue', type: 'DECIMAL' },
      { name: 'cost', type: 'DECIMAL' },
      { name: 'profit', type: 'DECIMAL' },
    ],
    rows: retailSales as any,
  },
  customers: {
    name: 'customers',
    columns: [
      { name: 'customer_id', type: 'VARCHAR' },
      { name: 'name', type: 'VARCHAR' },
      { name: 'tier', type: 'VARCHAR' },
      { name: 'signup_date', type: 'DATE' },
    ],
    rows: [
      { customer_id: 'C001', name: 'Acme Corp', tier: 'Gold', signup_date: '2023-05-12' },
      { customer_id: 'C002', name: 'Beta LLC', tier: 'Silver', signup_date: '2023-08-01' },
      { customer_id: 'C003', name: 'Gamma Inc', tier: 'Silver', signup_date: '2023-09-22' },
      { customer_id: 'C004', name: 'Delta Co', tier: 'Gold', signup_date: '2023-11-15' },
      { customer_id: 'C005', name: 'Epsilon Ltd', tier: 'Bronze', signup_date: '2024-01-03' },
      { customer_id: 'C006', name: 'Zeta GmbH', tier: 'Gold', signup_date: '2024-02-10' },
      { customer_id: 'C007', name: 'Eta SARL', tier: 'Silver', signup_date: '2024-02-18' },
      { customer_id: 'C008', name: 'Theta AB', tier: 'Gold', signup_date: '2024-02-22' },
    ],
  },
  employees: {
    name: 'employees',
    columns: [
      { name: 'employee_id', type: 'INT' },
      { name: 'department', type: 'VARCHAR' },
      { name: 'job_role', type: 'VARCHAR' },
      { name: 'age', type: 'INT' },
      { name: 'monthly_income', type: 'INT' },
      { name: 'years_at_company', type: 'INT' },
      { name: 'overtime', type: 'VARCHAR' },
      { name: 'attrition', type: 'VARCHAR' },
    ],
    rows: hrAnalytics as any,
  },
}

export const SAMPLE_SQL_QUERIES = [
  { label: 'Top 5 products by revenue', query: 'SELECT product, SUM(revenue) AS total_revenue FROM sales GROUP BY product ORDER BY total_revenue DESC LIMIT 5;', insight: 'Office Chair drives the most revenue. Stock and pricing decisions for furniture should be reviewed quarterly.' },
  { label: 'Revenue by region', query: 'SELECT region, SUM(revenue) AS total_revenue FROM sales GROUP BY region ORDER BY total_revenue DESC;', insight: 'The East and West regions lead revenue — consider regional marketing investments accordingly.' },
  { label: 'Profit by category', query: 'SELECT category, SUM(profit) AS total_profit FROM sales GROUP BY category ORDER BY total_profit DESC;', insight: 'Furniture and Electronics are the most profitable categories; Stationery contributes the least in absolute terms.' },
  { label: 'Customer tier analysis (JOIN)', query: 'SELECT c.tier, COUNT(s.order_id) AS orders, SUM(s.revenue) AS revenue FROM sales s JOIN customers c ON s.customer_id = c.customer_id GROUP BY c.tier ORDER BY revenue DESC;', insight: 'Gold-tier customers place more orders and generate higher revenue — retention efforts should prioritize them.' },
  { label: 'High-value orders (WHERE)', query: 'SELECT order_id, customer_id, product, revenue FROM sales WHERE revenue > 100 ORDER BY revenue DESC;', insight: 'High-value orders are dominated by Office Chair purchases — a small number of SKUs drive most revenue.' },
  { label: 'Avg order value by month', query: "SELECT SUBSTR(order_date, 1, 7) AS month, AVG(revenue) AS avg_order_value FROM sales GROUP BY SUBSTR(order_date, 1, 7) ORDER BY month;", insight: 'Average order value rises over the quarter — investigate whether bundle pricing is working.' },
]
