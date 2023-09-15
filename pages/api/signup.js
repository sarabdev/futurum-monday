import clientPromise from "../../lib/mongodb";
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
export default async (req, res) => {
  try {
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const baseUrl = `${protocol}://${req.headers.host}`;
    const client = await clientPromise;
    const db = client.db("futurum");
    const user = req.body;
    
    const userExist = await db.collection("users").findOne({email:user.email});
    if(userExist){
        res.json({error:true, message:"User already exist with this email."})
        return
    }
    const hashedPassword=await bcrypt.hash(user.password,10)
    const token=jwt.sign({email:user.email},'futurumString')
    await db.collection('users').insertOne({...user, password:hashedPassword, resetToken:null, verificationToken:token, isVerified:false})


    const transporter = nodemailer.createTransport({
      port: 465,
      host: "smtp.gmail.com",
      service:"gmail",
      auth: {
          user: 'ai@futurum.one',
          pass: process.env.APP_PASSWORD,//enable 2 factor authentication on gmail and generate a password from App passwords section 
      },
    })

    const info = await transporter.sendMail({
      from: `"Futurum"`, 
      to: user.email,//type the email where you want to send 
      subject: `Verify Your Email`, 
      text: "", 
      html: `
      
<!doctype html>
<html lang="en-US">

<head>
  <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
  <title>Reset Password Email Template</title>
  <meta name="description" content="Reset Password Email Template.">
  <style type="text/css">
      a:hover {text-decoration: underline !important;}
  </style>
</head>

<body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
  <!--100% body table-->
  <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
      style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
      <tr>
          <td>
              <table style="background-color: #f2f3f8; max-width:670px;  margin:0 auto;" width="100%" border="0"
                  align="center" cellpadding="0" cellspacing="0">
                 
                  <tr>
                      <td>
                          <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                              style="max-width:670px;background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                              <tr>
                                  <td style="height:40px;">&nbsp;</td>
                              </tr>
                              <tr>
                                  <td style="padding:0 35px;">
                                      <h1 style="color:#1e1e2d; font-weight:500; margin:0;font-size:32px;font-family:'Rubik',sans-serif;">Welcome to Futurum! Please verify your email to proceed.
                                          </h1>
                                      <span
                                          style="display:inline-block; vertical-align:middle; margin:29px 0 26px; border-bottom:1px solid #cecece; width:100px;"></span>
                                      <p style="color:#455056; font-size:15px;line-height:24px; margin:0;">
                                          A unique link to verify your
                                          email has been generated for you. To verify your email, click the
                                          following link and follow the instructions.
                                      </p>
                                      <a href="${baseUrl}/verify-email?token=${token}"
                                          style="background:#20e277;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 24px;display:inline-block;border-radius:50px;">Verify
                                          </a>
                                  </td>
                              </tr>
                              <tr>
                                  <td style="height:40px;">&nbsp;</td>
                              </tr>
                          </table>
                      </td>
                  <tr>
                      <td style="height:20px;">&nbsp;</td>
                  </tr>
                  <tr>
                      <td style="text-align:center;">
                          <p style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">&copy; <strong>chat.futurum.one</strong></p>
                      </td>
                  </tr>
                  <tr>
                      <td style="height:80px;">&nbsp;</td>
                  </tr>
              </table>
          </td>
      </tr>
  </table>
  <!--/100% body table-->
</body>

</html>
      
      `})



    res.json({error:false, message:"Please check your email for verification."})

  } catch (e) {
    console.log(e)
    res.json({error:true, message:"Something went wrong please try again."})
  }
};