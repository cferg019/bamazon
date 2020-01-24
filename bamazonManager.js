var mysql = require('./mysql.js')
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.getConnection();

connection.connect(function (err) {
    if (err) throw err;
    start();
});

var routerMap = {
    "View Products For Sale": viewProductsForSale,
    "View Low Inventory": viewLowInventory,
    "Add to Inventory": addToInventory,
    "Add New Product": addNewProduct
}

function start() {
    inquirer.prompt({
        name: "action",
        type: "list",
        choices: [
            "View Products For Sale",
            "View Low Inventory",
            "Add to Inventory",
            "Add New Product"
        ]
    }).then(answer => routerMap[answer.action]())
}

//IDs, names, prices, quantities
function viewProductsForSale() {
    connection.query("SELECT * FROM products p INNER JOIN departments d ON p.department_id = d.department_id", function (err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['ID #', 'Name', 'Dept', 'Price', 'Count']
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity])
        }
        console.log(table.toString());
        connection.end();
    });
}

//all items with inventory less than five
function viewLowInventory() {
    connection.query("SELECT * FROM products p INNER JOIN departments d ON p.department_id = d.department_id WHERE stock_quantity < 5", function (err, res) {
        if (err) throw err;
        var table = new Table({
            head: ['ID #', 'Name', 'Dept', 'Price', 'Count']
        });
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity])
        }
        console.log(table.toString());
        connection.end();
    });
}

//display a prompt that will allow manager to increase inventory of any item currently in stock
function addToInventory() {
    connection.query("SELECT * FROM products p INNER JOIN departments d ON p.department_id = d.department_id", function (err, res) {
        if (err) throw err;

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
                    message: "Which product's inventory should be increased?"
                },
                {
                    name: "quantity",
                    type: "input",
                    message: "How many units would you like to add?"
                }
            ]).then(function (answer) {
                for (var i = 0; i < res.length; i++) {
                    if (res[i].product_name == answer.product) {
                        var chosenItem = res[i];
                        var newQuantity = chosenItem.stock_quantity + parseInt(answer.quantity);
                        connection.query("UPDATE products SET ? WHERE ?", [{
                            stock_quantity: newQuantity
                        }, {
                            item_id: chosenItem.item_id
                        }], function (err, res) {
                            if (err) throw err;
                            console.log(chosenItem.product_name + " count has increased to " + newQuantity + ".")
                            connection.end();
                        })
                    }
                }
            })
    });
}

//display a prompt that will allow manager to add a new product to the store
function addNewProduct() {
    connection.query("SELECT * FROM departments", function (err, res) {
        if (err) throw err;

        inquirer.prompt([
            {
                name: "name",
                type: "input",
                message: "What product would you like to add to our store?"
            }, {
                name: "price",
                type: "input",
                message: "What is the price of this item?",
                validate: isANumber
            }, {
                name: "department",
                type: "list",
                choices: function () {
                    var choiceArray = [];
                    for (var i = 0; i < res.length; i++) {
                        choiceArray.push(res[i].department_name);
                    }
                    return choiceArray;
                },
                message: "Which department does this item belong in?"
            }, {
                name: "quantity",
                type: "input",
                message: "How many items are we adding to our inventory?",
                validate: isANumber
            }
        ]).then(function(answer) {
            var deptID;
            for (var i = 0; i < res.length; i++) {
                if (answer.department === res[i].department_name) {
                    deptID = res[i].department_id
                }
            }
            connection.query("INSERT INTO products SET ?", [{
                product_name: answer.name,
                price: answer.price,
                department_id: deptID, 
                stock_quantity: answer.quantity

            }], function (err, res) {
                if (err) throw err;
                console.log("You have successfully added " + answer.name + " to our store's inventory.")
                connection.end();
            })
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
