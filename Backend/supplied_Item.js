const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./quickmartdb");

// ✅ POST: Add a new supplied item record & update inventory stock
router.post("/", async (req, res) => {
    try {
        const { item_No, supplier_Id, item_Quantity, purchase_Date } = req.body;

        if (!item_No || !supplier_Id || !item_Quantity || !purchase_Date) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const pool = await poolPromise;
        const transaction = pool.transaction();

        await transaction.begin(); // Start transaction

        try {
            // Insert into Supplied_Items
            await transaction.request()
                .input("item_No", sql.Int, item_No)
                .input("supplier_Id", sql.Int, supplier_Id)
                .input("item_Quantity", sql.Int, item_Quantity)
                .input("purchase_Date", sql.Date, purchase_Date)
                .query(`
                    INSERT INTO Supplied_Items (item_No, supplier_Id, item_Quantity, purchase_Date) 
                    VALUES (@item_No, @supplier_Id, @item_Quantity, @purchase_Date)
                `);

            // Update Inventory stock
            await transaction.request()
                .input("item_No", sql.Int, item_No)
                .input("item_Quantity", sql.Int, item_Quantity)
                .query(`
                    UPDATE Inventory 
                    SET item_Quantity = item_Quantity + @item_Quantity
                    WHERE item_No = @item_No
                `);

            await transaction.commit(); // Commit transaction

            res.status(201).json({ message: "Supplied item record added & inventory updated successfully." });

        } catch (error) {
            await transaction.rollback(); // Rollback on error
            throw error;
        }

    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ GET: Fetch all supplied items
router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT SI.Sr_No, SI.item_No, I.item_Name, SI.supplier_Id, SI.item_Quantity, SI.purchase_Date
            FROM Supplied_Items SI
            JOIN Inventory I ON SI.item_No = I.item_No
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ GET: Fetch supplied item by ID
router.get("/:id", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("Sr_No", sql.Int, req.params.id)
            .query(`
                SELECT SI.Sr_No, SI.item_No, I.item_Name, SI.supplier_Id, SI.item_Quantity, SI.purchase_Date
                FROM Supplied_Items SI
                JOIN Inventory I ON SI.item_No = I.item_No
                WHERE SI.Sr_No = @Sr_No
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: "Supplied item record not found." });
        }

        res.status(200).json(result.recordset[0]);
    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ PUT: Update supplied item record
router.put("/:id", async (req, res) => {
    try {
        const { item_No, supplier_Id, item_Quantity, purchase_Date } = req.body;

        const pool = await poolPromise;
        const result = await pool.request()
            .input("Sr_No", sql.Int, req.params.id)
            .input("item_No", sql.Int, item_No)
            .input("supplier_Id", sql.Int, supplier_Id)
            .input("item_Quantity", sql.Int, item_Quantity)
            .input("purchase_Date", sql.Date, purchase_Date)
            .query(`
                UPDATE Supplied_Items 
                SET item_No = @item_No, supplier_Id = @supplier_Id, item_Quantity = @item_Quantity, purchase_Date = @purchase_Date
                WHERE Sr_No = @Sr_No
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Supplied item record not found." });
        }

        res.status(200).json({ message: "Supplied item record updated successfully." });

    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// ✅ DELETE: Remove supplied item record
router.delete("/:id", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("Sr_No", sql.Int, req.params.id)
            .query("DELETE FROM Supplied_Items WHERE Sr_No = @Sr_No");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: "Supplied item record not found." });
        }

        res.status(200).json({ message: "Supplied item record deleted successfully." });

    } catch (error) {
        console.error("SQL Error:", error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
