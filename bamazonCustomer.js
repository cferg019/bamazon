var mysql = require('./mysql.js')
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.getConnection();

connection.connect(function (err) {
    if (err) throw err;
    start();
});

function start() {
    connection.query("SELECT * FROM products p INNER JOIN departments d ON p.department_id = d.department_id", function (err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['ID #', 'Name', 'Dept', 'Price', 'Count']
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity])
        }
        console.log(table.toString());

        inquirer
            .prompt([
                {
                    name: "product",
                    type: "rawlist",
                    choices: function () {
                        var choiceArray = [];
                        for (var i = 0; i < res.length; i++) {
                            choiceArray.push(res[i].product_name);
                        }
                        return choiceArray;
                    },
                    message: "Please select which product you would like to purchase."
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many would you like to purchase?",
                    validate: isANumber
                }
            ])
            .then(function (answer) {
                for (var i = 0; i < res.length; i++) {
                    if (res[i].product_name == answer.product) {
                        var chosenItem = res[i];
                        if (chosenItem.stock_quantity >= answer.quantity) {
                            var finalCost = answer.quantity * chosenItem.price
                            connection.query("UPDATE products SET ? WHERE ?", [{
                                product_sales: chosenItem.product_sales + finalCost,
                                stock_quantity: chosenItem.stock_quantity - answer.quantity
                            }, {
                                item_id: chosenItem.item_id
                            }], function (err, res) {
                                if (err) throw err;
                                console.log("Yay! You ordered " + answer.quantity + " " + chosenItem.product_name + "! Your total will be $" + finalCost + ".")
                                connection.end();
                            })
                        } else {
                            console.log('Insufficient inventory! Too bad, so sad.')
                        }
                    }
                }
            })
    });
}



function isANumber(value) {
    if (isNaN(value) == false) {
        return true;
    } else {
        return false;
    }
}
