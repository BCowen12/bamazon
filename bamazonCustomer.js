var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');
var colors = require('colors');
var itemCount = [];


var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Bsblplyr12!",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;
    listProducts();
});


function listProducts() {
    itemCount = [];
    var query = "SELECT * FROM products";
    connection.query(query, function (err, res) {
        if (err) throw err;
        res.map(i => itemCount.push(i.id));
        var showTable = new Table({
            head: ["ID", "Name", "Price"],
            colWidths: [5, 25, 10]
        });
        for (var i = 0; i < res.length; i++) {
            showTable.push(
                [res[i].id, res[i].product_name, res[i].price]
            );
        }
        console.log(showTable.toString());
        
        purchase();
    });
}


function purchase(){
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
                message: "How many of this item would you like to order?",
                validate: isNumber
            }
        ]).then(function (total) {
            connection.query("SELECT stock_quantity as total, price, product_sales as sales FROM products where id = ?", item.choice,  function(err, ans) {
                if (err) throw err;
                inventory(item.choice, total.amount, ans[0].total, ans[0].price, ans[0].sales);
            });
        });
    });

}

function isNumber(num)
{
   var reg = /^\d+$/;
   return reg.test(num) || "This should be a number!".red;
}


function inventory(id, amount, total, price, sales){
    var count = total - amount;
        if(total < amount) console.log("Insufficient quantity!");
        else{
            connection.query("UPDATE products SET ? where ?", 
            [
                {
                    stock_quantity: count
                },
                {
                    id: id
                }
                ],  function(err) {
                if (err) throw err;
                price = parseInt(price) * parseInt(amount);
                console.log(("You owe $" + price.toFixed(2)).green);
                price += parseInt(sales);
                productSales(price, id);
                connection.end();
            });
        }
}


function productSales(price, id){
    connection.query("UPDATE products SET ? where ?", 
            [
                {
                    product_sales: price
                },
                {
                    id: id
                }
                ],  function(err) {
                if (err) throw err;
            });
}