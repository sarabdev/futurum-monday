const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient('mongodb+srv://sarab:futurumTest@cluster0.tteokeh.mongodb.net/');

const clientPromise = mongoClient.connect();
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': "https://chat.futurum.one",
    'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  }
  
const handler = async (event) => {
    try {
        const {prompt}=JSON.parse(event.body)
        const database = (await clientPromise).db('futurum');
        const collection = database.collection('templates');
         await collection.insertOne(prompt);
        return {
            statusCode: 200,
            headers:CORS_HEADERS,
            body: JSON.stringify({message:"added"}),
        }
    } catch (error) {
        
        return { statusCode: 500,      headers:CORS_HEADERS,
            body: error.toString() }
    }
}

module.exports = { handler }