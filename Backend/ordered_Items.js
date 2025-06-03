const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./quickmartdb");

// ✅ POST: Add a new ordered item record (Check inventory before inserting)
router.post("/", async (req, res) => {
    try {
        const { order_No, item_No, item_Quantity } = req.body;

        if (!order_No || !item_No || !item_Quantity) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const pool = await poolPromise;

        // 🔹 Check stock availability in Inventory
        const stockCheck = await pool.request()
            .input("item_No", sql.Int, item_No)
            .query(`SELECT item_Quantity FROM Inventory WHERE item_No = @item_No`);

        if (stockCheck.recordset.length === 0) {
            return res.status(404).json({ error: "Item not found in inventory." });
        }

        const availableStock = stockCheck.recordset[0].item_Quantity;

        if (availableStock < item_Quantity) {
            return res.status(400).json({ error: `Insufficient stock. Available: ${availableStock}` });
        }

        // 🔹 Begin transaction for consistency
        const transaction = pool.transaction();
        await transaction.begin();

        try {
            // 🔹 Insert ordered item
            await transaction.request()
                .input("order_No", sql.Int, order_No)
                .input("item_No", sql.Int, item_No)
                .input("item_Quantity", sql.Int, item_Quantity)
                .query(`
                    INSERT INTO Ordered_Item (order_No, item_No, item_Quantity) 
                    VALUES (@order_No, @item_No, @item_Quantity)
                `);

            // 🔹 Update inventory stock
            await transaction.request()
                .input("item_No", sql.Int, item_No)
                .input("newStock", sql.Int, availableStock - item_Quantity)
                .query(`
                    UPDATE Inventory SET item_Quantity = @newStock WHERE item_No = @item_No
                `);

            // 🔹 Commit transaction
            await transaction.commit();
            res.status(201).json({ message: "Ordered item added successfully, stock updated." });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ GET: Fetch all ordered items
router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT OI.order_No, OI.item_No, I.item_Name, OI.item_Quantity
            FROM Ordered_Item OI
            JOIN Inventory I ON OI.item_No = I.item_No
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ GET: Fetch ordered items by order number
router.get("/:order_No", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("order_No", sql.Int, req.params.order_No)
            .query(`
                SELECT OI.order_No, OI.item_No, I.item_Name, OI.item_Quantity
                FROM Ordered_Item OI
                JOIN Inventory I ON OI.item_No = I.item_No
                WHERE OI.order_No = @order_No
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "No ordered items found for this order." });
        }

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ PUT: Update item quantity in an order
router.put("/:order_No/:item_No", async (req, res) => {
    try {
        const { item_Quantity } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input("order_No", sql.Int, req.params.order_No)
            .input("item_No", sql.Int, req.params.item_No)
            .input("item_Quantity", sql.Int, item_Quantity)
            .query(`
                UPDATE Ordered_Item 
                SET item_Quantity = @item_Quantity
                WHERE order_No = @order_No AND item_No = @item_No
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Ordered item not found." });
        }

        res.status(200).json({ message: "Ordered item updated successfully." });

    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ DELETE: Remove an ordered item from an order
router.delete("/:order_No/:item_No", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("order_No", sql.Int, req.params.order_No)
            .input("item_No", sql.Int, req.params.item_No)
            .query("DELETE FROM Ordered_Item WHERE order_No = @order_No AND item_No = @item_No");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Ordered item not found." });
        }

        res.status(200).json({ message: "Ordered item removed successfully." });

    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
