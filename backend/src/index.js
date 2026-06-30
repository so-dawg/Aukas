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
const bookmarksRouter = require("./routes/bookmarks");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/users");
const applicationsRouter = require("./routes/applications");
const categoriesRouter = require("./routes/categories");
const mockMiddleware = require("./middleware/mock");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

if (process.env.USE_MOCK === "true") {
  app.use("/api", mockMiddleware);
} else {
  app.use("/api", healthRouter);
  app.use("/api", authRouter);
  app.use("/api", opportunitiesRouter);
  app.use("/api", bookmarksRouter);
  app.use("/api", organizationsRouter);
  app.use("/api", adminRouter);
  app.use("/api", userRouter);
  app.use("/api", applicationsRouter);
  app.use("/api", categoriesRouter);
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
