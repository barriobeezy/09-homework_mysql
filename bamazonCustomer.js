var inquirer = require("inquirer");
var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3307,
  user: "root",
  password: "root",
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");

});

function readProducts() {
  console.log("Selecting all products...\n");
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    // console.log(res.affectedRows);
    // connection.end();

    inquirer.prompt([{
      type: "list",
      name: "id",
      message: "Select a product to purchase...",
      choices: ["Banana", "Apple", "Orange", "Ramen", "Mac N' Cheese", "Szechuan Sauce", "Tapatio", "Mustard", "Frozen Pizza"]
    }, {
      type: "input",
      name: "qty",
      message: "How many would you like to purchase?",
      validate: function (value) {
        if (isNaN(value) == false) {
          return true;
        } else {
          return false;
        }
      }
    }]).then(function (answer) {
      for (var i = 0; i < res.length; i++) {
        if (res[i].product === (answer.id))
          onHand(answer.id, answer.qty);
      };
    });
  });
};

function onHand(id, qty) {
  connection.query("SELECT * FROM products WHERE ?", {
    id: id
  }, function (err, res) {
    if (err) throw err;

    if (res[0].quantity <= 0) {
      readProducts();
    } else
      updateQty(id, qty);
  });
}

function updateQty(id, qty) {
  connection.query("SELECT * FROM products WHERE ?", {
    id: id
  }, function (err, res) {
    if (err) throw err;
  });
  var newQty = res[0].quantity - qty;
  if (newQty < 0) {
    newQty = 0
  };
  connection.query("UPDATE products SET ? WHERE ?", [{
    quantity: newQty
  }, {
    id: id
  }]);

  console.log("You bought stuff!")
  readProducts();
};

readProducts();