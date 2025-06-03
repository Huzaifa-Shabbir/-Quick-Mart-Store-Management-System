const sql = require("mssql");

const database_config = {
    user: "project",  // ✅ Use `user`, NOT `login`
    password: "1234",
    server: "localhost",  // ✅ Use `server`, NOT `server_name`
    database: "Quick_Mart",
    port: 1434,  // Ensure your SQL Server is running on this port

    options: {
        encrypt: false,  // Set to `true` if using Azure
        enableArithAbort: true,
        trustServerCertificate: true, // Add this if using self-signed certificates
    },
};

// Create a connection pool
const poolPromise = new sql.ConnectionPool(database_config)

    .connect()
    .then((pool) => {
        console.log("✅ Connected to MSSQL");
        return pool;
    })
    .catch((err) => {
        console.error("❌ Database Connection Failed!", err);
        process.exit(1);
    });

module.exports = { sql, poolPromise };
