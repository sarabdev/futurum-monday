import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("futurum");
    const currentFolder = req.body;
    const filter = { id: currentFolder.id };
        

    await db.collection("folders").deleteOne(filter);

    res.json({message:"success"});
  } catch (e) {
    console.error(e);
    throw new Error(e).message;
  }
};