DROP DATABASE IF EXISTS bamazonDB;
CREATE DATABASE bamazonDB;

USE bamazonDB;

CREATE TABLE departments (
department_id INT NOT NULL AUTO_INCREMENT,
department_name VARCHAR(50) NOT NULL,
overhead_costs DECIMAL default 0,
PRIMARY KEY (department_id)
);

INSERT INTO departments (department_id, department_name, overhead_costs)
VALUES (1, 'Clothing', 25),
	   (2, 'Food & Drink', 21),
       (3, 'Toiletries', 14.5),
       (4, 'Electronics', 52),
       (5, 'Housewares', 23);


CREATE TABLE products (
	item_id INT NOT NULL AUTO_INCREMENT,
    product_name VARCHAR(50) NULL,
    product_sales DECIMAL default 0,
    department_id INT NOT NULL,
    price DECIMAL(5,2) default 0,
    stock_quantity INT NULL,
    PRIMARY KEY(item_id)
    );

INSERT INTO products (product_name, department_id, price, stock_quantity)
VALUES ('Tissues', 3, 5, 26), 
	   ('Chips', 2, 3, 14),
	   ('Scarf', 1, 20, 6), 
       ('Coat', 1, 45, 13), 
       ('Deodorant', 3, 4.5, 21),
       ('iPad', 4, 249.99, 10),
       ('Candles', 5, 10.24, 50),
       ('Meatballs', 2, 12, 83),
       ('Pillows', 5, 18, 10),
       ('TV', 4, 350, 3);

SELECT *
FROM products
INNER JOIN departments ON products.department_id = departments.department_id;


SELECT * FROM products;
SELECT * FROM departments;