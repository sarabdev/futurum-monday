import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("futurum");
    const prompt = req.body;
    const filter = { id: prompt.id };
        const updateDocument = {
             $set: {
               ...prompt
            },
         };
         delete updateDocument.$set._id;

          await db.collection("folders").updateOne(filter, updateDocument);

    res.json({message:"success"});
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
};