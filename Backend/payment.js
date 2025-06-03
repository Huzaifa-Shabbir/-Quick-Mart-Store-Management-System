const express = require("express");
const { sql, poolPromise } = require("./quickmartdb");

const router = express.Router();

/** 🔧 Helper: Calculate total price for an order */
const getOrderTotal = async (order_No) => {
    const pool = await poolPromise;
    const result = await pool.request()
        .input("order_No", sql.Int, order_No)
        .query(`
            SELECT SUM(Oi.item_Quantity * I.price) AS amount
            FROM Ordered_Item Oi
            JOIN Inventory I ON Oi.item_No = I.item_No
            RIGHT JOIN Orders O ON O.order_No = Oi.order_No
            WHERE O.order_No = @order_No
            GROUP BY O.order_No
        `);
    return result.recordset[0]?.amount || null;
};

/** ✅ POST: Add a new payment */
router.post("/", async (req, res) => {
    try {
        const { payment_Id, order_No, payment_Type, payment_Date } = req.body;

        if (!payment_Id || !order_No || !payment_Type || !payment_Date) {
            return res.status(400).json({ error: "All fields except amount are required." });
        }

        const amount = await getOrderTotal(order_No);
        if (amount === null) {
            return res.status(400).json({ error: "Order not found or has no items." });
        }

        const pool = await poolPromise;
        await pool.request()
            .input("payment_Id", sql.Int, payment_Id)
            .input("order_No", sql.Int, order_No)
            .input("payment_Type", sql.VarChar, payment_Type)
            .input("amount", sql.Decimal(10, 2), amount)
            .input("payment_Date", sql.Date, payment_Date)
            .query(`
                INSERT INTO Payment (payment_Id, order_No, payment_Type, amount, payment_Date)
                VALUES (@payment_Id, @order_No, @payment_Type, @amount, @payment_Date)
            `);

        res.status(201).json({ message: "Payment added successfully.", calculatedAmount: amount });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/** ✅ PUT: Update a payment (recalculate amount from order_No) */
router.put("/:id", async (req, res) => {
    try {
        const { order_No, payment_Type, payment_Date } = req.body;

        if (!order_No || !payment_Type || !payment_Date) {
            return res.status(400).json({ error: "All fields except amount are required." });
        }

        const amount = await getOrderTotal(order_No);
        if (amount === null) {
            return res.status(400).json({ error: "Order not found or has no items." });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input("payment_Id", sql.Int, req.params.id)
            .input("order_No", sql.Int, order_No)
            .input("payment_Type", sql.VarChar, payment_Type)
            .input("amount", sql.Decimal(10, 2), amount)
            .input("payment_Date", sql.Date, payment_Date)
            .query(`
                UPDATE Payment
                SET order_No = @order_No, payment_Type = @payment_Type, amount = @amount, payment_Date = @payment_Date
                WHERE payment_Id = @payment_Id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Payment not found." });
        }

        res.json({ message: "Payment updated successfully.", recalculatedAmount: amount });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/** ✅ GET: All payments */
router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Payment");
        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/** ✅ GET: Payment by ID */
router.get("/:id", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("payment_Id", sql.Int, req.params.id)
            .query("SELECT * FROM Payment WHERE payment_Id = @payment_Id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Payment not found." });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

/** ✅ DELETE: Remove payment */
router.delete("/:id", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("payment_Id", sql.Int, req.params.id)
            .query("DELETE FROM Payment WHERE payment_Id = @payment_Id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Payment not found." });
        }

        res.json({ message: "Payment deleted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
