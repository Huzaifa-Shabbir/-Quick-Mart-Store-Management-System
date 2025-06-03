const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./quickmartdb");

// ✅ Fetch all orders with calculated amount
router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                O.order_No, 
                O.order_Date, 
                O.customer_Id, 
                O.Address,
                ISNULL(SUM(I.price * OI.item_Quantity), 0) AS amount
            FROM Orders O
            LEFT JOIN Ordered_Item OI ON O.order_No = OI.order_No
            LEFT JOIN Inventory I ON OI.item_No = I.item_No
            GROUP BY O.order_No, O.order_Date, O.customer_Id, O.Address
        `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch a specific order with calculated amount
router.get("/:orderNo", async (req, res) => {
    try {
        const { orderNo } = req.params;
        if (isNaN(orderNo)) {
            return res.status(400).json({ message: "Invalid order number format" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("orderNo", sql.Int, orderNo)
            .query(`
                SELECT 
                    O.order_No, 
                    O.order_Date, 
                    O.customer_Id, 
                    O.Address,
                    ISNULL(SUM(I.price * OI.quantity), 0) AS amount
                FROM Orders O
                LEFT JOIN Ordered_Item OI ON O.order_No = OI.order_No
                LEFT JOIN Inventory I ON OI.item_No = I.item_No
                WHERE O.order_No = @orderNo
                GROUP BY O.order_No, O.order_Date, O.customer_Id, O.Address
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Add a new order
router.post("/", async (req, res) => {
    try {
        const { orderNo, orderDate, customerId, address } = req.body;

        if (!orderNo || !orderDate || !customerId || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const pool = await poolPromise;
        await pool
            .request()
            .input("orderNo", sql.Int, orderNo)
            .input("orderDate", sql.Date, orderDate)
            .input("customerId", sql.Int, customerId)
            .input("address", sql.VarChar, address)
            .query("INSERT INTO Orders (order_No, order_Date, customer_Id, Address) VALUES (@orderNo, @orderDate, @customerId, @address)");

        res.status(201).json({ message: "Order added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Update an order
router.put("/:orderNo", async (req, res) => {
    try {
        const { orderNo } = req.params;
        const { orderDate, customerId, address } = req.body;

        if (isNaN(orderNo)) {
            return res.status(400).json({ message: "Invalid order number format" });
        }
        if (!orderDate || !customerId || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("orderNo", sql.Int, orderNo)
            .input("orderDate", sql.Date, orderDate)
            .input("customerId", sql.Int, customerId)
            .input("address", sql.VarChar, address)
            .query("UPDATE Orders SET order_Date = @orderDate, customer_Id = @customerId, Address = @address WHERE order_No = @orderNo");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Delete an order
router.delete("/:orderNo", async (req, res) => {
    try {
        const { orderNo } = req.params;
        if (isNaN(orderNo)) {
            return res.status(400).json({ message: "Invalid order number format" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("orderNo", sql.Int, orderNo)
            .query("DELETE FROM Orders WHERE order_No = @orderNo");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;