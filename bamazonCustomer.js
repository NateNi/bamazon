var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "barrels2569",
  database: "bamazon"
});

let total = 0;

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  console.log("WELCOME TO BAMAZON!");
  console.log("-------------------");
  queryAllItems();
});

function queryAllItems() {
  connection.query("SELECT * FROM products", function(err, res) {
    res.forEach(product => {
      console.log(
        `Product ID: ` +
          `${product.item_id}\n` +
          `Product Name: ` +
          `${product.product_name}\n` +
          `Department: ` +
          `${product.department_name}\n` +
          `Price: $` +
          ` ${product.price}\n` +
          `Stock Quantity: ` +
          ` ${product.stock_quantity}\n\n`
      );
    });
    askCustomer();
    //connection.end();
  });
}

function askCustomer() {
  inquirer
    .prompt([
      {
        name: "purchaseID",
        message: "Please enter the ID of the product you want to purchase: "
      },
      {
        name: "numBuy",
        message: "Please enter the quantity you want to purchase: "
      }
    ])
    .then(function(answers) {
      console.log(`You want to purchase ${answers.numBuy} of product ID ${answers.purchaseID}.`);
      let buyNumber = parseInt(answers.numBuy);
      let buyID = parseInt(answers.purchaseID);


      connection.query("SELECT * FROM products WHERE item_id = ?", [answers.purchaseID], function(err, res){
            let numLeft = res[0].stock_quantity;
            console.log("-------------------");
            if (numLeft < buyNumber) {
                console.log("There is not enough of the item in inventory to complete your order. Please try again.");
            } else {
                total += (buyNumber*res[0].price);
                console.log("Your total is: $" + total);
                numLeft -= buyNumber;
                connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [numLeft, res[0].item_id], function(err,res){})
            }
            console.log("-------------------");
            queryAllItems();
      })
    });
}
