const express = require("express");
const router = express.Router();
const { sql, poolPromise } = require("./quickmartdb");

// ✅ Fetch all feedback
router.get("/", async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT FM.feedback_Id, FM.order_No, FC.customer_Id, C.name AS customer_Name,
                   FM.rating, FM.feedback_Message
            FROM Feedback_Main FM
            JOIN Feedback_Customer FC ON FM.order_No = FC.order_No
            JOIN Customer C ON FC.customer_Id = C.customer_Id
        `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Fetch feedback by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("feedbackID", sql.Int, id)
            .query(`
                SELECT FM.feedback_Id, FM.order_No, FC.customer_Id, C.name AS customer_Name,
                       FM.rating, FM.feedback_Message
                FROM Feedback_Main FM
                JOIN Feedback_Customer FC ON FM.order_No = FC.order_No
                JOIN Customer C ON FC.customer_Id = C.customer_Id
                WHERE FM.feedback_Id = @feedbackID
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Add new feedback
// ✅ Add new feedback with order/customer match validation
router.post("/", async (req, res) => {
    try {
        const { feedback_Id, customer_Id, order_No, rating, feedback_Message } = req.body;

        if (!feedback_Id || !customer_Id || !order_No || !rating) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const pool = await poolPromise;

        // Step 1: Validate order_No belongs to customer_Id
        const validationResult = await pool.request()
            .input("orderNo", sql.Int, order_No)
            .input("customerID", sql.Int, customer_Id)
            .query(`
                SELECT * FROM Orders
                WHERE order_No = @orderNo AND customer_Id = @customerID
            `);

        if (validationResult.recordset.length === 0) {
            return res.status(400).json({ message: "Order does not belong to the specified customer." });
        }

        // Step 2: Insert into Feedback_Main
        await pool.request()
            .input("feedbackID", sql.Int, feedback_Id)
            .input("orderNo", sql.Int, order_No)
            .input("rating", sql.Int, rating)
            .input("feedbackMsg", sql.Text, feedback_Message)
            .query(`
                INSERT INTO Feedback_Main (feedback_Id, order_No, rating, feedback_Message)
                VALUES (@feedbackID, @orderNo, @rating, @feedbackMsg)
            `);

        // Step 3: Insert into Feedback_Customer
        await pool.request()
            .input("orderNo", sql.Int, order_No)
            .input("customerID", sql.Int, customer_Id)
            .query(`
                INSERT INTO Feedback_Customer (order_No, customer_Id)
                VALUES (@orderNo, @customerID)
            `);

        res.status(201).json({ message: "Feedback added successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// ✅ Update feedback
router.put("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, feedback_Message } = req.body;

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const pool = await poolPromise;
        const result = await pool
            .request()
            .input("feedbackID", sql.Int, id)
            .input("rating", sql.Int, rating)
            .input("feedbackMsg", sql.Text, feedback_Message)
            .query(`
                UPDATE Feedback_Main
                SET rating = @rating, feedback_Message = @feedbackMsg
                WHERE feedback_Id = @feedbackID
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        res.json({ message: "Feedback updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ✅ Delete feedback
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ID format" });
        }

        const pool = await poolPromise;

        // Step 1: Get order number for the feedback ID
        const orderResult = await pool
            .request()
            .input("feedbackID", sql.Int, id)
            .query("SELECT order_No FROM Feedback_Main WHERE feedback_Id = @feedbackID");

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: "Feedback not found" });
        }

        const order_No = orderResult.recordset[0].order_No;

        // Step 2: Delete the feedback from Feedback_Main
        const deleteResult = await pool
            .request()
            .input("feedbackID", sql.Int, id)
            .query("DELETE FROM Feedback_Main WHERE feedback_Id = @feedbackID");

        // Step 3: Check if any other feedbacks exist for this order_No
        const feedbackCountResult = await pool
            .request()
            .input("orderNo", sql.Int, order_No)
            .query("SELECT COUNT(*) AS count FROM Feedback_Main WHERE order_No = @orderNo");

        const count = feedbackCountResult.recordset[0].count;

        // Step 4: If none exist, delete from Feedback_Customer
        if (count === 0) {
            await pool
                .request()
                .input("orderNo", sql.Int, order_No)
                .query("DELETE FROM Feedback_Customer WHERE order_No = @orderNo");
        }

        res.json({ message: "Feedback deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
