const mongoose = require("mongoose");

function connectToDatabase(MONGO_URI) {
  mongoose
    .connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("MongoDB connected successfully"))
    .catch((error) => {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    });

  mongoose.connection.on("error", (error) => {
    console.error("MongoDB connection error:", error);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
  });
}

module.exports = connectToDatabase;