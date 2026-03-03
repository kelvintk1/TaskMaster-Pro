const { MongoClient } = require('mongodb');

// Your connection string - remove the "MONGODB_URI=" part!
const uri = "mongodb://tettehk537:Qwerty123456@ac-ltpieed-shard-00-00.dskip37.mongodb.net:27017,ac-ltpieed-shard-00-01.dskip37.mongodb.net:27017,ac-ltpieed-shard-00-02.dskip37.mongodb.net:27017/taskmaster?replicaSet=atlas-11u96z-shard-0&ssl=true&authSource=admin&retryWrites=true";

async function testConnection() {
  console.log("Testing MongoDB connection...");
  console.log("Connection string (password hidden):", uri.replace(/:[^:@]+@/, ':****@'));
  
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
  });
  
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");
    
    const db = client.db("taskmaster");
    // Try to insert a test document
    const result = await db.collection("test").insertOne({ 
      test: "data", 
      timestamp: new Date(),
      message: "Test connection successful" 
    });
    console.log("✅ Inserted test document with ID:", result.insertedId);
    
    // Read it back
    const doc = await db.collection("test").findOne({ _id: result.insertedId });
    console.log("✅ Retrieved test document:", doc);
    
  } catch (error) {
    console.error("❌ Connection failed:", error.message);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

testConnection();