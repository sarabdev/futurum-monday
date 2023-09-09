const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient('mongodb+srv://sarab:futurumTest@cluster0.tteokeh.mongodb.net/');

const clientPromise = mongoClient.connect();
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': "*",
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  }
  
const handler = async (event) => {
    try {
        const database = (await clientPromise).db('futurum');
        const collection = database.collection('templates');
         const templates=await collection.find({}).toArray();
        return {
            statusCode: 200,
            headers:CORS_HEADERS,
            body: JSON.stringify({templates}),
        }
    } catch (error) {
        
        return { statusCode: 500,      headers:CORS_HEADERS,
            body: error.toString() }
    }
}

module.exports = { handler }