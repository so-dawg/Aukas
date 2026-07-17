const path = require("path");
const crypto = require("crypto");

const rootEnvPath = path.resolve(__dirname, "..", "..", ".env");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: rootEnvPath });
}

const { Op } = require("sequelize");
const { Opportunity } = require("./models");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const yamljs = require("yamljs");

const sequelize = require("./db");
const healthRouter = require("./routes/health");
const contactRouter = require("./routes/contact");
const authRouter = require("./routes/auth");
const opportunitiesRouter = require("./routes/opportunities");
const errorHandler = require("./middleware/error");
const organizationsRouter = require("./routes/organizations");
const bookmarksRouter = require("./routes/bookmarks");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/users");
const applicationsRouter = require("./routes/applications");
const categoriesRouter = require("./routes/categories");
const swaggerDocument = yamljs.load(
  path.resolve(__dirname, "..", "..", "docs", "api", "openapi.yaml"),
);

setInterval(
  async () => {
    try {
    await Opportunity.update(
      { status: "expired" },
      {
        where: {
          status: "approved",
          deadline: { [Op.lt]: new Date().toISOString().split("T")[0] },
          deleted_at: null,
        },
      },
    );} catch (err) {
      console.error("Expiry job failed:", err);
    }
  },
  60 * 60 * 1000,
);

const app = express();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 200,
  message: { error: { message: "Too many requests, please try again later." } },
});
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 100 : 500,
  message: { error: { message: "Too many requests, please try again later." } },
});
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(morgan("short"));
app.use(express.json());

app.use((req, _res, next) => {
  req.requestId = crypto.randomUUID();
  next();
});

app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

app.use("/api", healthRouter);
app.use("/api", authRouter);
app.use("/api", opportunitiesRouter);
app.use("/api", bookmarksRouter);
app.use("/api", organizationsRouter);
app.use("/api/admin", adminRouter);
app.use("/api", userRouter);
app.use("/api", applicationsRouter);
app.use("/api", categoriesRouter);
app.use("/api", contactRouter);

app.use(errorHandler);

if (!process.env.VERCEL) {
  sequelize
    .sync()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error("Database sync failed:", err);
      process.exit(1);
    });
}

module.exports = app;
