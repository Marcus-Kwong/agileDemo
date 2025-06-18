var express = require('express');
var app = express();

// ✅ 新增：限制请求体大小，防止 DoS 攻击
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // ✅ 新增
app.use(express.json({ limit: '1mb' })); // ✅ 新增

/* define pictures, css and images folders */
app.use(express.static('public'));
app.use('/assets', express.static(__dirname + '/assets'));
app.use('/Cycle1', express.static(__dirname + '/views/Cycle1'));
app.use('/Cycle2', express.static(__dirname + '/views/Cycle2'));
app.use('/Cycle3', express.static(__dirname + '/views/Cycle3'));

// ✅ 新增：使用连接池统一管理数据库连接
const mysql = require('mysql2');
const pool = mysql.createPool({
    host: process.env.DB_HOST || "mysql", // 根据实际部署修改
    user: process.env.DB_USER || "user99",
    password: process.env.DB_PASSWORD || "user99",
    database: process.env.DB_NAME || "comp7780",
    waitForConnections: true,               // ✅ 新增
    connectionLimit: 10,                    // ✅ 新增
    queueLimit: 0,                          // ✅ 新增
    connectTimeout: 5000                   // ✅ 新增
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/views/homePage.html");
});

app.get('/Cycle1_home', function(req, res) {
    res.sendFile(__dirname + "/views/Cycle1/cycle1_home.html");
});

app.get('/Cycle1_product', function(req, res) {
    res.sendFile(__dirname + "/views/Cycle1/cycle1_product.html");
});

app.get('/Cycle2', function(req, res) {
    res.sendFile(__dirname + "/views/Cycle2/cycle2_home.html");
});

app.get('/Cycle2/product', function(req, res) {
    res.sendFile(__dirname + "/views/Cycle2/cycle2_product.html");
});

app.get('/Cycle2/product/cart', function(req, res) {
    res.send(`
    <script>
      alert("Add Cart -- need MySQL support");
      window.history.back();
    </script>
  `);
});

app.get('/Cycle2/product/check_out', function(req, res) {
    res.send(`
    <script>
      alert("Check Out -- need MySQL support");
      window.history.back();
    </script>
  `);
});

app.get('/Cycle3', function(req, res) {
    res.sendFile(__dirname + "/views/Cycle3/cycle3_home.html");
});

app.get('/Cycle3/product', function(req, res) {
    res.sendFile(__dirname + "/views/Cycle3/cycle3_product.html");
});

app.post('/Cycle3/cart', function(req, res) {
    var prod_id = req.body.prod_id;
    var qty = req.body.qty;
    var price = req.body.price;
    var f_username = req.body.f_username;

    var responseText = `Prod_id: ${prod_id}<br>Qty: ${qty}<br>Price: ${price}<br>Username: ${f_username}<br><br>`;

    var now = new Date();
    var cur_date_yyyy_mm_dd = now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();

    var sql = "INSERT INTO cart (cust_username, cart_order_date, prod_id, cart_qty, cart_price) VALUES (?, ?, ?, ?, ?)";
    pool.query(sql, [f_username, cur_date_yyyy_mm_dd, prod_id, qty, price], function(err, result) {
        if (err) {
            console.error('Database query error:', err);
            responseText += 'MySQL ERROR: Item not added!<br>';
        } else {
            if (result.affectedRows > 0) {
                responseText += `Thank you for your order! ${f_username}<br>The above item has been added to your shopping cart.<br>`;
            } else {
                responseText += 'MySQL ERROR: Item not added!<br>';
            }
        }
        responseText += '<br><br><input type="button" value="Close this page" onclick="self.close();" />';
        res.send(responseText);
    });
});

app.post('/Cycle3/check_out', function(req, res) {
    var username = req.body.f_check_out_username;
    var cartData = req.body.cart_data;

    var responseText = `<!DOCTYPE html><head><meta name="viewport" content="width=device-width, initial-scale=1"><meta http-equiv="X-UA-Compatible" content="IE=edge" /></head><body><script src="https://www.paypal.com/sdk/js?client-id=ATSWa9vavLRPYABa5DAFOb7d6xFXlYIfpC4eE0ML-fo4wvxD7MhswAQkklI625Mqnbudf6psDaPUC5mj"></script>`;

    var sql = `SELECT DATE_FORMAT(cart.cart_order_date, '%Y-%m-%d') AS order_date, cart.prod_id, product.prod_desc, cart.cart_qty, cart.cart_price FROM cart INNER JOIN product ON cart.prod_id = product.prod_id WHERE cart.cust_username = ? ORDER BY order_date ASC, prod_id DESC;`;
    pool.query(sql, [username], function(err, result) {
        if (err) {
            console.error('Database query error:', err);
            responseText += 'Error retrieving order details. Please try again later.</body></html>';
            res.send(responseText);
            return;
        }

        responseText += `Thank you for your order! ${username}<br>Your order details: <br><br><table border="2"><tr><th>Original Order Date</th><th>Product ID</th><th>Product Description</th><th>Quantity</th><th>Price</th><th>Amount</th></tr>`;

        var total_due = 0;
        if (result.length === 0) {
            responseText += '<tr><td colspan="6">No items found in your cart.</td></tr>';
        } else {
            result.forEach(row => {
                var sub_total = row.cart_qty * row.cart_price;
                responseText += `<tr><td>${row.order_date}</td><td>${row.prod_id}</td><td>${row.prod_desc}</td><td>${row.cart_qty}</td><td>${row.cart_price}</td><td>${sub_total}</td></tr>`;
                total_due += sub_total;
            });
        }

        responseText += `</table><br>Total Due: ${total_due.toFixed(2)}<br><br><div id="paypal-button-container"></div><p id="txt1"></p><script>paypal.Buttons({createOrder:function(data, actions){return actions.order.create({purchase_units:[{amount:{value:${total_due}}}]});},onApprove:function(data, actions){return actions.order.capture().then(function(details){alert("Transaction completed by " + details.payer.name.given_name);document.querySelector("#txt1").innerHTML = "Payment has completed! This web page can be closed now!";document.querySelector("#txt1").style.backgroundColor = "yellow";document.querySelector("#txt1").style.color = "red";fetch("/Cycle3/clear_cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ f_username: "${username}" }) });});}}).render("#paypal-button-container");</script></body></html>`;

        res.send(responseText);
    });
});

app.post('/Cycle3/clear_cart', function(req, res) {
    var username = req.body.f_username;
    var sql = "DELETE FROM cart WHERE cust_username = ?";
    pool.query(sql, [username], function(err, result) {
        if (err) {
            console.error('Database query error:', err);
            res.send('Error clearing cart');
            return;
        }
        console.log('Cart cleared for user:', username, 'Affected rows:', result.affectedRows);
        res.send('Cart cleared');
    });
});

app.listen(3000, '0.0.0.0', function() {
    console.log('App running at http://localhost:3000');
});

console.log('DB_HOST:', process.env.DB_HOST);
console.log('End of Program.');
