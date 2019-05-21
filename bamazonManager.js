var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var colors = require('colors');
var itemCount = [];
var quantity = [];


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Bsblplyr12!",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    managerFuncitons();
});


function managerFuncitons() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What do you want to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit"]
        }
    ]).then(function (response) {
        itemCount = [];
        quantity = [];
        var query = "SELECT * FROM products";
        connection.query(query, function (err, res) {
            if (err) throw err;
            res.map(i => itemCount.push(i.id));
            res.map(i => quantity.push(parseInt(i.stock_quantity)));
            switch (response.action) {
                case "View Products for Sale":
                    listEverything();
                    break;
                case "View Low Inventory":
                    lowInventory();
                    break;
                case "Add to Inventory":
                    addInventory();
                    break;
                case "Add New Product":
                    addProduct();
                    break;
                case "Quit":
                    console.log("Thank you, hope to see you again!".red);
                    connection.end();
                    break;
            }
        });
    });
}


function listEverything() {
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        var showTable = new Table({
            head: ["ID", "Name", "Price", "Quantity"],
            colWidths: [5, 25, 10, 10]
        });
        for (var i = 0; i < res.length; i++) {
            showTable.push(
                [res[i].id, res[i].product_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(showTable.toString());

        managerFuncitons();
    });
}


function lowInventory() {
    var query = "SELECT * FROM products where stock_quantity < 5";
    connection.query(query, function (err, res) {
        if (err) throw err;
        var showTable = new Table({
            head: ["ID", "Name", "Price", "Quantity"],
            colWidths: [5, 25, 10, 10]
        });
        for (var i = 0; i < res.length; i++) {
            showTable.push(
                [res[i].id, res[i].product_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(showTable.toString());

        managerFuncitons();
    });
}


function addInventory() {
    inquirer.prompt([
        {
            type: "list",
            name: "choice",
            message: "What item ID would you like to chose?",
            choices: itemCount
        }
    ]).then(function howMany(item) {
        inquirer.prompt([
            {
                type: "input",
                name: "amount",
                message: "How many of this item would you like to add?",
                validate: isNumber
            }
        ]).then(function (total) {
            var newTotal = quantity[item.choice - 1] + parseInt(total.amount);
            connection.query("UPDATE products SET ? where ?",
                [
                    {
                        stock_quantity: newTotal
                    },
                    {
                        id: item.choice
                    }
                ], function (err) {
                    if (err) throw err;
                    console.log(("There are now " + newTotal + " of item ID " + item.choice).green);
                    managerFuncitons();
                });
        });
    });

}


function isNumber(num) {
    var reg = /^\d+$/;
    return reg.test(num) || "This should be a number!".red;
}


function addProduct() {
    inquirer.prompt([
        {
            name: "item",
            type: "input",
            message: "What is the item you would like to post?"
        },
        {
            name: "category",
            type: "input",
            message: "What department should this item go in?"
        },
        {
            name: "price",
            type: "input",
            message: "How much should this item cost?",
            validate: isNumber
        },
        {
            name: "amount",
            type: "input",
            message: "How many of this item do you have in stock?",
            validate: isNumber
        }
    ])
        .then(function (answer) {
            connection.query("INSERT INTO products SET ?",
                {
                    product_name: answer.item,
                    department_name: answer.category,
                    price: answer.price,
                    stock_quantity: answer.amount
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your item has been added!".green)
                    managerFuncitons();
                });
        });

}