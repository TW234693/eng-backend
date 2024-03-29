const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3500;
const connectDB = require("./config/connectDB");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/userRouter");
const clientRouter = require("./routes/clientRouter");
const mealRouter = require("./routes/mealRouter");
const authRouter = require("./routes/authRouter");
const registerRouter = require("./routes/registerRouter");
const searchRouter = require("./routes/searchRouter");
const ingredientRouter = require("./routes/ingredientRouter");

require("dotenv").config();
connectDB();
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/register", registerRouter);
app.use("/search", searchRouter);
app.use("/users", userRouter);
app.use("/clients", clientRouter);
app.use("/meals", mealRouter);
app.use("/ingredients", ingredientRouter);

app.all("*", (_, res) => {
  res.status(404);
  res.json({ message: "404 Not Found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
