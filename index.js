var express = require('express');
var app = express();
app.use(express.urlencoded({ extended: true }));  // 解析 form 表单 POST 数据
app.use(express.json());  // 解析 application/json 数据（已经用在 fetch）

/* define pictures, css and images folders */
app.use(express.static('public'));
app.use('/Cycle1', express.static(__dirname + '/Cycle1'));
app.use('/Cycle2', express.static(__dirname + '/Cycle2'));
app.use('/Cycle3', express.static(__dirname + '/Cycle3'));


app.get('/', function(req, res) {
    res.sendFile(__dirname + "/homePage.html");
});

app.get('/Cycle1', function(req, res) {
    res.sendFile(__dirname + "/Cycle1/cycle1_home.html");
});

//Cycle2
app.get('/Cycle2', function(req, res) {
    res.sendFile(__dirname + "/Cycle2/cycle2_home.html");
});

app.get('/Cycle2/product', function(req, res) {
		res.sendFile(__dirname + "/Cycle2/cycle2_product.html");
	});

app.get('/Cycle2/product/cart', function(req, res) {
		res.send(`
    <script>
      alert("🛒 Add Cart -- need MySQL support");
      window.history.back(); // 或跳转 window.location.href = "/Cycle2/cycle2_product.html"
    </script>
  `);
	});

app.get('/Cycle2/product/check_out', function(req, res) {
		res.send(`
    <script>
      alert("🛒 Check Out -- need MySQL support");
      window.history.back(); // 或跳转 window.location.href = "/Cycle2/cycle2_product.html"
    </script>
  `);
	});

//Cycle3
app.get('/Cycle3', function(req, res) {
    res.sendFile(__dirname + "/Cycle3/cycle3_home.html");
});

app.get('/Cycle3/product', function(req, res) {
		res.sendFile(__dirname + "/Cycle3/cycle3_product.html");
	});

// 添加到购物车路由（改为 POST 方法）
app.post('/Cycle3/cart', function(req, res) {
    var prod_id = req.body.prod_id;
    var qty = req.body.qty;
    var price = req.body.price;
    var f_username = req.body.f_username;

    var responseText = 'Prod_id: ' + prod_id + '<br>';
    responseText += 'Qty: ' + qty + '<br>';
    responseText += 'Price: ' + price + '<br>';
    responseText += 'Username: ' + f_username + '<br><br>';

    var now = new Date();
    var cur_date_yyyy_mm_dd = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
    console.log("cur_date_yyyy_mm_dd is: " + cur_date_yyyy_mm_dd);

    const mysql = require('mysql2');
    const con = mysql.createConnection({
        host: process.env.DB_HOST || "mysql",     
        user: process.env.DB_USER || "user99",
        password: process.env.DB_PASSWORD || "user99",
        database: process.env.DB_NAME || "comp7780"
    });

    con.connect(function(err) {
        if (err) {
            console.error('Database connection error:', err);
            responseText += 'Error connecting to database. Please try again later.';
            res.send(responseText);
            return;
        }

        var sql = "INSERT INTO cart (cust_username, cart_order_date, prod_id, cart_qty, cart_price) VALUES (?, ?, ?, ?, ?)";
        con.query(sql, [f_username, cur_date_yyyy_mm_dd, prod_id, qty, price], function(err, result) {
            if (err) {
                console.error('Database query error:', err);
                responseText += 'MySQL ERROR: Item not added!<br>';
                responseText += '<br><br>';
                responseText += '<input type="button" value="Close this page" onclick="self.close();" />';
                res.send(responseText);
                con.end();
                return;
            }

            console.log(result);
            console.log('Affected rows:', result.affectedRows);

            if (result.affectedRows > 0) {
                responseText += 'Thank you for your order! ' + f_username + '<br>';
                responseText += 'The above item has been added to your shopping cart. <br>';
            } else {
                responseText += 'MySQL ERROR: Item not added!<br>';
            }
            responseText += '<br><br>';
            responseText += '<input type="button" value="Close this page" onclick="self.close();" />';
            res.send(responseText);
            con.end();
        });
    });
});

// 结账路由（POST 方法）
app.post('/Cycle3/check_out', function(req, res) {
    var username = req.body.f_check_out_username;
    var cartData = req.body.cart_data;

    console.log('Checkout request received:', { username, cartData });

    var responseText = '<!DOCTYPE html>';
    responseText += '<head><meta name="viewport" content="width=device-width, initial-scale=1">';
    responseText += '<meta http-equiv="X-UA-Compatible" content="IE=edge" /></head>';
    responseText += '<body><script src="https://www.paypal.com/sdk/js?client-id=ATSWa9vavLRPYABa5DAFOb7d6xFXlYIfpC4eE0ML-fo4wvxD7MhswAQkklI625Mqnbudf6psDaPUC5mj">';
    responseText += '</script>';

    const mysql = require('mysql2');
    const con = mysql.createConnection({
        host: process.env.DB_HOST || "mysql",     
        user: process.env.DB_USER || "user99",
        password: process.env.DB_PASSWORD || "user99",
        database: process.env.DB_NAME || "comp7780"
    });

    con.connect(function(err) {
        if (err) {
            console.error('Database connection error:', err);
            responseText += 'Error connecting to database. Please try again later.';
            responseText += '</body></html>';
            res.send(responseText);
            return;
        }

        // 使用参数化查询防止 SQL 注入
        var sql = "SELECT DATE_FORMAT(cart.cart_order_date, '%Y-%m-%d') AS order_date, " +
            "cart.prod_id, product.prod_desc, cart.cart_qty, cart.cart_price " +
            "FROM cart " +
            "INNER JOIN product ON cart.prod_id = product.prod_id " +
            "WHERE cart.cust_username = ? " +
            "ORDER BY order_date ASC, prod_id DESC;";
        console.log('Executing SQL:', sql, 'with username:', username);

        con.query(sql, [username], function(err, result) {
            if (err) {
                console.error('Database query error:', err);
                responseText += 'Error retrieving order details. Please try again later.';
                responseText += '</body></html>';
                res.send(responseText);
                con.end();
                return;
            }

            console.log('Query result:', result);

            responseText += 'Thank you for your order! ' + username + '<br>';
            responseText += 'Your order details: <br><br>';
            responseText += '<table border="2">';
            responseText += '<tr><th>Original Order Date</th><th>Product ID</th><th>Product Description</th><th>Quantity</th><th>Price</th><th>Amount</th></tr>';

            var total_due = 0;
            var sub_total = 0;
            if (result.length === 0) {
                responseText += '<tr><td colspan="6">No items found in your cart.</td></tr>';
            } else {
                for (var i = 0; i < result.length; i++) {
                    sub_total = result[i].cart_qty * result[i].cart_price;
                    responseText += '<tr><td>' + result[i].order_date + '</td><td>' + result[i].prod_id + '</td><td>' + result[i].prod_desc + '</td><td>' + result[i].cart_qty + '</td><td>' + result[i].cart_price + '</td><td>' + sub_total + '</td></tr>';
                    total_due += sub_total;
                }
            }
            responseText += '</table>';
            responseText += '<br>Total Due: ' + total_due.toFixed(2);
            responseText += '<br><br>';

            responseText += '<div id="paypal-button-container"></div>';
            responseText += '<p id="txt1"></p>';
            responseText += '<script>';
            responseText += 'paypal.Buttons({';
            responseText += 'createOrder: function(data, actions) {';
            responseText += 'return actions.order.create({';
            responseText += 'purchase_units: [{';
            responseText += 'amount: {';
            responseText += 'value: ' + total_due + '}';
            responseText += '}]';
            responseText += '});';
            responseText += '},';
            responseText += 'onApprove: function(data, actions) {';
            responseText += 'return actions.order.capture().then(function(details) {';
            responseText += 'alert("Transaction completed by " + details.payer.name.given_name);';
            responseText += 'document.querySelector("#txt1").innerHTML = "Payment has completed! This web page can be closed now!";';
            responseText += 'document.querySelector("#txt1").style.backgroundColor = "yellow";';
            responseText += 'document.querySelector("#txt1").style.color = "red";';
            // 支付成功后清空购物车
            responseText += 'fetch("/Cycle3/clear_cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ f_username: "' + username + '" }) });';
            responseText += '});';
            responseText += '}';
            responseText += '}).render("#paypal-button-container");';
            responseText += '</script>';
            responseText += '</body></html>';

            res.send(responseText);
            con.end();
        });
    });
});

// 清空购物车路由
app.post('/Cycle3/clear_cart', function(req, res) {
    var username = req.body.f_username;

    const mysql = require('mysql2');
    const con = mysql.createConnection({
        host: process.env.DB_HOST || "mysql",     
        user: process.env.DB_USER || "user99",
        password: process.env.DB_PASSWORD || "user99",
        database: process.env.DB_NAME || "comp7780"
    });

    con.connect(function(err) {
        if (err) {
            console.error('Database connection error:', err);
            res.send('Error connecting to database');
            return;
        }

        var sql = "DELETE FROM cart WHERE cust_username = ?";
        con.query(sql, [username], function(err, result) {
            if (err) {
                console.error('Database query error:', err);
                res.send('Error clearing cart');
                con.end();
                return;
            }

            console.log('Cart cleared for user:', username, 'Affected rows:', result.affectedRows);
            res.send('Cart cleared');
            con.end();
        });
    });
});

// Start the server
app.listen(3000, '0.0.0.0', function() {
    console.log('App running at http://localhost:3000');
});

//end
console.log('DB_HOST:', process.env.DB_HOST);
console.log('End of Program.');
