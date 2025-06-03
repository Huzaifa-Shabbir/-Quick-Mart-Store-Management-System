const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./quickmartdb");

// ✅ POST: Add a new inventory item
router.post("/", async (req, res) => {
    try {
        const { item_No, item_Name, category, price, item_Quantity } = req.body;

        if (!item_No || !item_Name || price === undefined || item_Quantity === undefined) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const pool = await poolPromise;
        await pool.request()
            .input("item_No", sql.Int, item_No)
            .input("item_Name", sql.VarChar, item_Name)
            .input("category", sql.VarChar, category || null)
            .input("price", sql.Decimal(10,2), price)
            .input("item_Quantity", sql.Int, item_Quantity)
            .query(`
                INSERT INTO Inventory (item_No, item_Name, category, price, item_Quantity) 
                VALUES (@item_No, @item_Name, @category, @price, @item_Quantity)
            `);

        res.status(201).json({ message: "Item added successfully." });

    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ GET: Fetch all inventory items
router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Inventory");
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ GET: Fetch item by ID
router.get("/:id", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("item_No", sql.Int, req.params.id)
            .query("SELECT * FROM Inventory WHERE item_No = @item_No");

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Item not found." });
        }

        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ PUT: Update inventory item
router.put("/:id", async (req, res) => {
    try {
        const { item_Name, category, price, item_Quantity } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input("item_No", sql.Int, req.params.id)
            .input("item_Name", sql.VarChar, item_Name)
            .input("category", sql.VarChar, category || null)
            .input("price", sql.Decimal(10,2), price)
            .input("item_Quantity", sql.Int, item_Quantity)
            .query(`
                UPDATE Inventory 
                SET item_Name = @item_Name, category = @category, price = @price, item_Quantity = @item_Quantity
                WHERE item_No = @item_No
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Item not found." });
        }

        res.status(200).json({ message: "Item updated successfully." });

    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ DELETE: Remove inventory item
router.delete("/:id", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("item_No", sql.Int, req.params.id)
            .query("DELETE FROM Inventory WHERE item_No = @item_No");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Item not found." });
        }

        res.status(200).json({ message: "Item deleted successfully." });

    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
