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
    supervisorFuncitons();
});


function supervisorFuncitons() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "What do you want to do?",
            choices: ["View Product Sales by Department", "Create New Department", "Quit"]
        }
    ]).then(function (response) {
            switch (response.action) {
                case "View Product Sales by Department":
                    departmentSales();
                    break;
                case "Create New Department":
                    newDepartment();
                    break;
                case "Quit":
                    console.log("Thank you, hope to see you again!".red);
                    connection.end();
                    break;
            }
    });
}


function departmentSales(){
    var query = "select department_id, d.department_name, over_head_costs, ifnull(sum(product_sales), 0) as product_sales, ifnull((sum(product_sales) - over_head_costs),0) as total_profit from departments d left join products p on p.department_name = d.department_name group by department_id";
    connection.query(query, function (err, res) {
        if (err) throw err;
        res.map(i => itemCount.push(i.id));
        var showTable = new Table({
            head: ["department_id", "department_name", "over_head_costs", "product_sales", "total_profit"],
            colWidths: [20, 25, 20, 20, 20]
        });
        for (var i = 0; i < res.length; i++) {
            showTable.push(
                [res[i].department_id, res[i].department_name, res[i].over_head_costs, res[i].product_sales, res[i].total_profit]
            );
        }
        console.log(showTable.toString());
        
        supervisorFuncitons();
    });
}


function newDepartment() {
    inquirer.prompt([
        {
            name: "department",
            type: "input",
            message: "What is the department you would like to create?"
        },
        {
            name: "price",
            type: "input",
            message: "What is the over head cost?",
            validate: isNumber
        }
    ])
        .then(function (answer) {
            connection.query("INSERT INTO departments SET ?",
                {
                    department_name: answer.department,
                    over_head_costs: answer.price
                },
                function (err) {
                    if (err) throw err;
                    console.log("Your department has been added!".green)
                    supervisorFuncitons();
                });
        });

}

function isNumber(num) {
    var reg = /^\d+$/;
    return reg.test(num) || "This should be a number!".red;
}