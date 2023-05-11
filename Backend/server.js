const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = require("./app");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.set("strictQuery", false);

mongoose.connect(DB).then(con => {
    console.log("DB connection succesful")
})

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
    console.log(`Listening on port ... ${port}`)
})
