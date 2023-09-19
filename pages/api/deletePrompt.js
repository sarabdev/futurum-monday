import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("futurum");
    const prompt = req.body;
    const filter = { id: prompt.id };
        

    await db.collection("templates").deleteOne(filter);

    res.json({message:"success"});
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
};