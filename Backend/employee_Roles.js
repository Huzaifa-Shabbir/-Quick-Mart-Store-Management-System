const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./quickmartdb"); // Adjust the path as needed

// ✅ Get All Employee Roles
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM Employee_Roles");
    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Get Roles for a Specific Employee
router.get("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("employee_Id", sql.Int, req.params.id)
      .query("SELECT * FROM Employee_Roles WHERE employee_Id = @employee_Id");

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "No roles found for this employee." });
    }

    res.json(result.recordset);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Add Role to Employee
router.post("/", async (req, res) => {
  try {
    const { employee_Id, role_of_Employee } = req.body;

    if (!employee_Id || !role_of_Employee) {
      return res.status(400).json({ error: "employee_Id and role_of_Employee are required." });
    }

    const pool = await poolPromise;
    await pool.request()
      .input("employee_Id", sql.Int, employee_Id)
      .input("role_of_Employee", sql.VarChar(100), role_of_Employee)
      .query("INSERT INTO Employee_Roles (employee_Id, role_of_Employee) VALUES (@employee_Id, @role_of_Employee)");

    res.status(201).json({ message: "Role added successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Update Employee Role
router.put("/", async (req, res) => {
  try {
    const {
      originalEmployee_Id,
      originalRole,
      updatedEmployee_Id,
      updatedRole
    } = req.body;

    if (!originalEmployee_Id || !originalRole || !updatedEmployee_Id || !updatedRole) {
      return res.status(400).json({ error: "All fields are required for update." });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input("originalEmployee_Id", sql.Int, originalEmployee_Id)
      .input("originalRole", sql.VarChar(100), originalRole)
      .input("updatedEmployee_Id", sql.Int, updatedEmployee_Id)
      .input("updatedRole", sql.VarChar(100), updatedRole)
      .query(`
        UPDATE Employee_Roles
        SET employee_Id = @updatedEmployee_Id, role_of_Employee = @updatedRole
        WHERE employee_Id = @originalEmployee_Id AND role_of_Employee = @originalRole
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Original role not found." });
    }

    res.json({ message: "Role updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Delete Role from Employee
router.delete("/", async (req, res) => {
  try {
    const { employee_Id, role_of_Employee } = req.body;

    if (!employee_Id || !role_of_Employee) {
      return res.status(400).json({ error: "employee_Id and role_of_Employee are required." });
    }

    const pool = await poolPromise;
    const result = await pool.request()
      .input("employee_Id", sql.Int, employee_Id)
      .input("role_of_Employee", sql.VarChar(100), role_of_Employee)
      .query("DELETE FROM Employee_Roles WHERE employee_Id = @employee_Id AND role_of_Employee = @role_of_Employee");

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: "Role not found for this employee." });
    }

    res.json({ message: "Role deleted successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
