const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./quickmartdb");

// Utility function to validate contact number
const isValidContact = (contact) => /^\d{10,15}$/.test(contact);

// ✅ Fetch all employees
router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM Employee");
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch an employee by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("employeeID", sql.Int, id)
            .query("SELECT * FROM Employee WHERE employee_Id = @employeeID");

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Add a new employee
router.post("/", async (req, res) => {
    try {
        const { employee_Id, employee_Name, salary, contact } = req.body;

        if (!employee_Id || !employee_Name || !salary || !contact) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!isValidContact(contact)) {
            return res.status(400).json({ message: "Invalid contact number format" });
        }

        const pool = await poolPromise;
        await pool
            .request()
            .input("employeeID", sql.Int, employee_Id)
            .input("employeeName", sql.VarChar, employee_Name)
            .input("salary", sql.Decimal(10, 2), salary)
            .input("contact", sql.VarChar, contact)
            .query(`
                INSERT INTO Employee (employee_Id, employee_Name, salary, contact)
                VALUES (@employeeID, @employeeName, @salary, @contact)
            `);

        res.status(201).json({ message: "Employee added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Update an employee
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { employee_Name, salary, contact } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        if (!employee_Name || !salary || !contact) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!isValidContact(contact)) {
            return res.status(400).json({ message: "Invalid contact number format" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("employeeID", sql.Int, id)
            .input("employeeName", sql.VarChar, employee_Name)
            .input("salary", sql.Decimal(10, 2), salary)
            .input("contact", sql.VarChar, contact)
            .query(`
                UPDATE Employee
                SET employee_Name = @employeeName, salary = @salary, contact = @contact
                WHERE employee_Id = @employeeID
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ message: "Employee updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Delete an employee
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("employeeID", sql.Int, id)
            .query("DELETE FROM Employee WHERE employee_Id = @employeeID");

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Employee not found" });
        }

        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
