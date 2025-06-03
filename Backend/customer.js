const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./quickmartdb");

// Utility function to validate phone number
const isValidPhone = (phone) => /^\d{10,15}$/.test(phone);

// ✅ Fetch all customers
router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Customer");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch a customer by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("customerID", sql.Int, id)
            .query("SELECT * FROM Customer WHERE customer_Id = @customerID");

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

//insert new data
router.post("/", async (req, res) => {
    try {
        const { id, name, phone } = req.body;

        if (!id || !name || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const pool = await poolPromise;
        await pool
            .request()
            .input("customerID", sql.Int, id)
            .input("name", sql.VarChar, name)
            .input("phone", sql.VarChar, phone)
            .query("INSERT INTO Customer (customer_Id, name, phone_Number) VALUES (@customerID, @name, @phone)");

        res.status(201).json({ message: "Customer added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ✅ Update a customer
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, phone } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        if (!name || !phone) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!isValidPhone(phone)) {
            return res.status(400).json({ message: "Invalid phone number format" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("customerID", sql.Int, id)
            .input("name", sql.VarChar, name)
            .input("phone", sql.VarChar, phone)
            .query("UPDATE Customer SET name = @name, phone_Number = @phone WHERE customer_Id = @customerID");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json({ message: "Customer updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Delete a customer
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("customerID", sql.Int, id)
            .query("DELETE FROM Customer WHERE customer_Id = @customerID");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Customer not found" });
        }

        res.json({ message: "Customer deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
