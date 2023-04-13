const app = require("./app");
const connectDatabase = require("./config/database");


const PORT=process.env.PORT || 5000;


connectDatabase();

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
