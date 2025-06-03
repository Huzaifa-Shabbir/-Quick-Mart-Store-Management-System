const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/emissions", require("./routes/emissions"));

app.listen(3001, () => console.log("Server on port 3001"));
