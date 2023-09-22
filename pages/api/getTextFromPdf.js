import pdf from 'pdf-parse';



  export default async (req, res) => {
    try {
    //  if(!req.files && !req.files.pdf){
    //   res.json({error:"not found"})
    //  }
     console.log(req.body)
      //const pdfBuffer = req.file.buffer;
      // const data = await pdf(pdfBuffer);
      // const text = data.text;
  
      res.status(200).json({ text });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: 'An error occurred while processing the PDF file' });
    }
  };
  