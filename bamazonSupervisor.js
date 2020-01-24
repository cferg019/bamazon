var mysql = require('./mysql.js')
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.getConnection();

connection.connect(function (err) {
    if (err) throw err;
    start();
});

var routerMap = {
    "View Product Sales by Department": viewProductSales,
    "Create New Department": createNewDept
}

function start() {
    inquirer.prompt({
        name: "action",
        type: "list",
        choices: [
            "View Product Sales by Department",
            "Create New Department"
        ]
    }).then(answer => routerMap[answer.action]())
}

function viewProductSales() {
    var query = "SELECT d.department_id, d.department_name, d.overhead_costs, SUM(p.product_sales) AS total_sales " +
        "FROM departments d LEFT JOIN products p ON d.department_id = p.department_id " +
        "GROUP BY d.department_id ORDER BY total_sales DESC"
    connection.query(query, function (err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['Dept ID', 'Dept Name', 'Overhead Costs', 'Product Sales', 'Total Profit']
        });
        for (var i = 0; i < res.length; i++) {
            if (res[i].total_sales === null) {
                res[i].total_sales = 0;
            }
            var total_profit = res[i].total_sales - res[i].overhead_costs
            table.push([res[i].department_id, res[i].department_name, res[i].overhead_costs, res[i].total_sales, total_profit])
        }
        console.log(table.toString());
        connection.end();
    });
}

function createNewDept() {
    inquirer.prompt([
        {
            name: "name",
            type: "input",
            message: "What is the name of our new department?"
        }, {
            name: "overhead",
            type: "input",
            message: "What are the overhead costs for managing this department?",
            validate: isANumber
        }
    ]).then(function (answer) {
        connection.query("INSERT INTO departments SET ?", [{
            department_name: answer.name,
            overhead_costs: answer.overhead
        }], function (err, res) {
            if (err) throw err;
            console.log("You have successfully added " + answer.name + " to our store's wide range of departments.")
            connection.end();
        })
    })
}



function isANumber(value) {
    if (isNaN(value) == false) {
        return true;
    } else {
        return false;
    }
}
