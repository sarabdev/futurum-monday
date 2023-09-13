import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("futurum");
    const prompt = req.body;
    console.log(prompt)
    const post = await db.collection("templates").insertOne(prompt);

    res.json(post);
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
};