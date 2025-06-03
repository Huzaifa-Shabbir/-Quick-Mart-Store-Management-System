const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./quickmartdb");

// ✅ Fetch all deliveries
router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT DM.delivery_Id, DM.order_No, DM.employee_Id,
                   DS.delivery_Status, DS.expected_time
            FROM Delivery_Main DM
            JOIN Delivery_Status DS ON DM.order_No = DS.order_No
        `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch delivery by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ message: "Invalid delivery ID" });

        const pool = await poolPromise;
        const result = await pool.request()
            .input("deliveryID", sql.Int, id)
            .query(`
                SELECT DM.delivery_Id, DM.order_No, DM.employee_Id,
                       DS.delivery_Status, DS.expected_time
                FROM Delivery_Main DM
                JOIN Delivery_Status DS ON DM.order_No = DS.order_No
                WHERE DM.delivery_Id = @deliveryID
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Delivery not found" });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Add new delivery
router.post("/", async (req, res) => {
    try {
        const { delivery_Id, order_No, employee_Id, delivery_Status, expected_time } = req.body;

        if (!delivery_Id || !order_No || !employee_Id || !delivery_Status || !expected_time) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const pool = await poolPromise;

        // Check if delivery_Id already exists
        const checkDelivery = await pool.request()
            .input("deliveryID", sql.Int, delivery_Id)
            .query("SELECT 1 FROM Delivery_Main WHERE delivery_Id = @deliveryID");

        if (checkDelivery.recordset.length > 0) {
            return res.status(400).json({ message: "Delivery ID already exists" });
        }

        // Check if order already has delivery status
        const checkOrder = await pool.request()
            .input("orderNo", sql.Int, order_No)
            .query("SELECT 1 FROM Delivery_Status WHERE order_No = @orderNo");

        if (checkOrder.recordset.length > 0) {
            return res.status(400).json({ message: "Order already has delivery status" });
        }

        // Insert transaction
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await transaction.request()
                .input("deliveryID", sql.Int, delivery_Id)
                .input("orderNo", sql.Int, order_No)
                .input("empID", sql.Int, employee_Id)
                .query(`
                    INSERT INTO Delivery_Main (delivery_Id, order_No, employee_Id)
                    VALUES (@deliveryID, @orderNo, @empID)
                `);

            await transaction.request()
                .input("orderNo", sql.Int, order_No)
                .input("status", sql.VarChar, delivery_Status)
                .input("expectedTime", sql.Time, expected_time)
                .input("empID", sql.Int, employee_Id)
                .query(`
                    INSERT INTO Delivery_Status (order_No, delivery_Status, expected_time,employee_Id)
                    VALUES (@orderNo, @status, @expectedTime,@empID)
                `);

            await transaction.commit();
            res.status(201).json({ message: "Delivery added successfully" });

        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Update delivery status & expected time
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { delivery_Status, expected_time } = req.body;

        if (isNaN(id)) return res.status(400).json({ message: "Invalid delivery ID" });
        if (!delivery_Status || !expected_time) {
            return res.status(400).json({ message: "Status and expected time are required" });
        }

        const pool = await poolPromise;

        // Get order_No from delivery_Id
        const orderResult = await pool.request()
            .input("deliveryID", sql.Int, id)
            .query("SELECT order_No FROM Delivery_Main WHERE delivery_Id = @deliveryID");

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: "Delivery not found" });
        }

        const order_No = orderResult.recordset[0].order_No;

        // Update
        const result = await pool.request()
            .input("orderNo", sql.Int, order_No)
            .input("status", sql.VarChar, delivery_Status)
            .input("expectedTime", sql.Time, expected_time)
            .query(`
                UPDATE Delivery_Status
                SET delivery_Status = @status, expected_time = @expectedTime
                WHERE order_No = @orderNo
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Update failed" });
        }

        res.json({ message: "Delivery updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Delete delivery
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) return res.status(400).json({ message: "Invalid delivery ID" });

        const pool = await poolPromise;

        const orderResult = await pool.request()
            .input("deliveryID", sql.Int, id)
            .query("SELECT order_No FROM Delivery_Main WHERE delivery_Id = @deliveryID");

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: "Delivery not found" });
        }

        const order_No = orderResult.recordset[0].order_No;

        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        try {
            await transaction.request()
                .input("orderNo", sql.Int, order_No)
                .query("DELETE FROM Delivery_Status WHERE order_No = @orderNo");

            await transaction.request()
                .input("deliveryID", sql.Int, id)
                .query("DELETE FROM Delivery_Main WHERE delivery_Id = @deliveryID");

            await transaction.commit();
            res.json({ message: "Delivery deleted successfully" });
        } catch (err) {
            await transaction.rollback();
            throw err;
        }

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
