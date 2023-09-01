const { MongoClient } = require("mongodb");

const mongoClient = new MongoClient('mongodb+srv://sarab:futurumTest@cluster0.tteokeh.mongodb.net/');

const clientPromise = mongoClient.connect();

const handler = async (event) => {
    try {
        const {prompt}=JSON.parse(event.body)
        const database = (await clientPromise).db('futurum');
        const collection = database.collection('templates');
         await collection.insertOne(prompt);
        return {
            statusCode: 200,
            body: JSON.stringify({message:"added"}),
        }
    } catch (error) {
        return { statusCode: 500, body: error.toString() }
    }
}

module.exports = { handler }