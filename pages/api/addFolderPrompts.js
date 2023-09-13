import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("futurum");
    const prompts = req.body;
    const post = await db.collection("templates").insertMany(prompts);

    res.json(post);
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
};