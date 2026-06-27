require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const healthRouter = require("./routes/health");
const authRouter = require("./routes/auth");
const opportunitiesRouter = require("./routes/opportunities");
const errorHandler = require("./middleware/error");
const organizationsRouter = require("./routes/organizations");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", healthRouter);
app.use("/api", authRouter);
app.use("/api", opportunitiesRouter);
app.use("/api", bookmarksRouter);
app.use("/api", organizationsRouter);

app.use(errorHandler);

app.listen(PORT, () => {
   console.log(`Server running on port ${PORT}`);
});
