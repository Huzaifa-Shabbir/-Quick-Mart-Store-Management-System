const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./quickmartdb"); // Import MSSQL connection

// ✅ Get All Suppliers
router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Supplier");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Get Supplier by ID
router.get("/:id", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input("supplier_Id", sql.Int, req.params.id)
            .query("SELECT * FROM Supplier WHERE supplier_Id = @supplier_Id");

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Supplier not found." });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Add a New Supplier
router.post("/", async (req, res) => {
    try {
        const { supplier_Id, supplier_Name, contact_No, supplier_Address } = req.body;

        if (!supplier_Id || !supplier_Name) {
            return res.status(400).json({ error: "supplier_Id and supplier_Name are required." });
        }

        const pool = await poolPromise;
        await pool.request()
            .input("supplier_Id", sql.Int, supplier_Id)
            .input("supplier_Name", sql.VarChar(255), supplier_Name)
            .input("contact_No", sql.VarChar(15), contact_No)
            .input("supplier_Address", sql.VarChar(255), supplier_Address)
            .query("INSERT INTO Supplier (supplier_Id, supplier_Name, contact_No, supplier_Address) VALUES (@supplier_Id, @supplier_Name, @contact_No, @supplier_Address)");

        res.status(201).json({ message: "Supplier added successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Update Supplier Details
router.put("/:id", async (req, res) => {
    try {
        const { supplier_Name, contact_No, supplier_Address } = req.body;
        const supplier_Id = req.params.id;

        const pool = await poolPromise;
        const result = await pool.request()
            .input("supplier_Id", sql.Int, supplier_Id)
            .input("supplier_Name", sql.VarChar(255), supplier_Name)
            .input("contact_No", sql.VarChar(15), contact_No)
            .input("supplier_Address", sql.VarChar(255), supplier_Address)
            .query(`
                UPDATE Supplier 
                SET supplier_Name = @supplier_Name, 
                    contact_No = @contact_No, 
                    supplier_Address = @supplier_Address
                WHERE supplier_Id = @supplier_Id
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Supplier not found." });
        }

        res.json({ message: "Supplier updated successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Delete Supplier
router.delete("/:id", async (req, res) => {
    try {
        const supplier_Id = req.params.id;

        const pool = await poolPromise;
        const result = await pool.request()
            .input("supplier_Id", sql.Int, supplier_Id)
            .query("DELETE FROM Supplier WHERE supplier_Id = @supplier_Id");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Supplier not found." });
        }

        res.json({ message: "Supplier deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
