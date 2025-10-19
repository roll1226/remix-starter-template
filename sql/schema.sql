DROP TABLE IF EXISTS Customers;
CREATE TABLE IF NOT EXISTS Customers (CustomerId INTEGER PRIMARY KEY, CompanyName TEXT, ContactName TEXT);
INSERT INTO Customers (CustomerID, CompanyName, ContactName) VALUES (1, 'Alfreds Futterkiste', 'Maria Anders'), (4, 'Around the Horn', 'Thomas Hardy'), (11, 'Bs Beverages', 'Victoria Ashworth'), (13, 'Bs Beverages', 'Random Name');

DROP TABLE IF EXISTS Todos;
CREATE TABLE IF NOT EXISTS Todos (TodoId INTEGER PRIMARY KEY, Title TEXT, IsComplete BOOLEAN);
INSERT INTO Todos (TodoId, Title, IsComplete) VALUES (1, 'Task 1', 0), (2, 'Task 2', 1), (3, 'Task 3', 0);
