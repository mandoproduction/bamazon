//manager below
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Soccer25%",
  database: "bamazon_db"
})

connection.connect(function (err) {
  console.log("Connected as id:", connection.threadId);
  start();
})

function start() {
  inquirer.prompt({
      type: "list",
      name: "list",
      message: "Choose an option:",
      choices: ["View Products For Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Quit\n"]
  }).then(function (answer) {
      if (answer.list === "View Products For Sale") {
          createTable();
      } else if (answer.list === "View Low Inventory") {
          viewInventory();
      } else if (answer.list === "Add to Inventory") {
          addInventory();
      } else if (answer.list === "Add New Product") {
          addProduct();
      } else {
          console.log("Thanks for using Bamazon Manager App.")
          connection.end();
      }
  })
}

function createTable() {
  var table = new Table({
      head: ['ID', 'Name', 'Department', 'Price', 'Quantity'],
  });
  connection.query("SELECT * FROM products", function (err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
          table.push(
              [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]
          );
      }
      console.log(table.toString());
      start();
  })
}
function viewInventory() {
  var table = new Table({
      head: ['ID', 'Name', 'Department', 'Price', 'Quantity'],
  });
  connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (err, res) {
      if (err) throw err;
      for (var i = 0; i < res.length; i++) {
          table.push(
              [res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity],
          );
      }
      console.log(table.toString());
      start();
  })

}

var newStock = 0;

function addInventory() {
  inquirer.prompt([{
      name: "item_id",
      message: "To which item (by ID) would you like to add stock?",
  }, {
      name: "stock",
      message: "How much stock would you like to add?",
  }]).then(function (answer) {
      connection.query("SELECT stock_quantity FROM products WHERE ?", [{
          item_id: answer.item_id
      }, function (err, res) {
          if (err) throw err;
          newStock = res[0].stock_quantity
      }])
      connection.query("UPDATE products SET ? WHERE  ?", [{
          stock_quantity: newStock += parseInt(answer.stock)
      }, {
          item_id: answer.item_id
      }], function (err, res) {
          if (err) throw err;
          console.log("\n You have updated the stock quanitity of item number", answer.item_id, "\n");
          start();

      })
  })

}
function addProduct() {
  inquirer.prompt([{
      name: "item_name",
      message: "What item would you like to add?"
  }, {
      name: "department",
      message: "What department is the item in?"
  }, {
      name: "price",
      message: "What is the price of the item"
  }, {
      name: "stock",
      message: "How much inventory do you have?"
  }]).then(function (answer) {
      console.log(answer.item_name)
      connection.query("INSERT INTO products SET ?", [{
          product_name: answer.item_name,
          department_name: answer.department,
          price: answer.price,
          stock_quantity: answer.stock
      }], function (err, res) {
          if (err) throw err;
          console.log("\n Item successfuly added to inventory \n");
          start();
      })
  })
}