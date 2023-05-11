const fs = require("fs");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Book = require("./../../models/bookModel");
const Users = require('./../../models/userModel');
const User = require("./../../models/userModel");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<password>",
  process.env.DATABASE_PASSWORD
);

mongoose.set("strictQuery", false);

mongoose.connect(DB).then((con) => {
  console.log("DB connection succesful");
});

//read json file

//const books = JSON.parse(fs.readFileSync(`${__dirname}/books.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));



//import data into db
const importData = async () => {
  try {
    //await Book.create(books);
    await Users.create(users, {validateBeforeSave:false})
    console.log("Data successfully loaded!")
    process.exit();
  } catch (err) {
    console.log(err);
  }
};

//delete all data from db
const deleteData = async () => {
    try {
      await User.deleteMany()
      console.log("Data successfully deleted!")
      process.exit();
    } catch (err) {
      console.log(err);
    }
  };


  if(process.argv[2] === '--import') {
    importData()
  } else if(process.argv[2] === '--delete'){
    deleteData()
  }

