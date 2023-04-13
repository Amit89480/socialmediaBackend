const mongoose = require("mongoose");


const mongoURI="mongodb://pamit7407084:amit1234@ac-qlj9iah-shard-00-00.vji6igs.mongodb.net:27017,ac-qlj9iah-shard-00-01.vji6igs.mongodb.net:27017,ac-qlj9iah-shard-00-02.vji6igs.mongodb.net:27017/pamit7407084?ssl=true&replicaSet=atlas-ev8405-shard-0&authSource=admin&retryWrites=true&w=majority"
const connectDatabase = () => {
  mongoose
    .connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((connection) => {
      console.log("Database connected");
    })
    .catch((err) => {
      console.log("internal server error");
    });
};


module.exports = connectDatabase;