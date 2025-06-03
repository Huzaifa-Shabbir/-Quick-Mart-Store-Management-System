const express = require("express");
const { sql, poolPromise } = require("./quickmartdb");

const customer_Route = require("./customer");
const orders_Route = require("./orders");
const feedback_Routes = require("./feedback");
const employee_Routes = require("./employee");
const employee_Roles_Routes = require("./employee_Roles");
const supplier_Route = require("./supplier");
const payment_Routes = require("./payment");
const delivery_Routes = require("./delivery");
const inventory_Routes = require("./inventory");
const supplied_Items_Routes = require("./supplied_Item");
const ordered_Items_Routes = require("./ordered_Items");

const cors = require('cors');

const app = express();

// ✅ CORS Middleware - Add this before your routes
app.use(cors()); // This enables CORS for all routes with default settings

// For more specific CORS configuration (optional):
// app.use(cors({
//   origin: ['http://localhost:3000', 'https://yourfrontend.com'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

app.use(express.json()); // Middleware to parse JSON request body

app.get('/health', (req, res) => {
  res.json({ message: 'QuickMart API is healthy' });
});

app.get('/api/customers', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Customers');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use((req, res, next) => {
  console.log(`🔹 [${req.method}] ${req.url}`);
  console.log("📝 Received Data:", req.body);
  next();
});

const PORT = process.env.PORT || 4000;

// ✅ Test Database Connection
poolPromise.then(() => console.log("Database Ready!")).catch(err => console.error(err));

// ✅ Default Route
app.get("/", (req, res) => {
    res.send("Ready to manage your Store!");
});

// ✅ Mounting Routes
app.use("/customer", customer_Route);
app.use("/orders", orders_Route);
app.use("/feedback", feedback_Routes);
app.use("/employee", employee_Routes);
app.use("/employee_Roles", employee_Roles_Routes);
app.use("/supplier", supplier_Route);
app.use("/payment", payment_Routes);
app.use("/delivery", delivery_Routes);
app.use("/inventory", inventory_Routes);
app.use("/supplied_Item", supplied_Items_Routes);
app.use("/ordered_Items", ordered_Items_Routes);

// ✅ Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});