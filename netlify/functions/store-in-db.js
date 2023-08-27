const mongoose = require("mongoose");

exports.handler = async function (event, context) {
  try {
    // Connect to MongoDB using Mongoose
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Use your existing Mongoose model
    const Data = mongoose.model("Users"); // Replace with your model name

    // Create a new document
    const newData = new Data({ key: "someKey", value: "someValue" });

    // Save the document to the database
    await newData.save();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data stored successfully" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error storing data", error }),
    };
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
  }
};
