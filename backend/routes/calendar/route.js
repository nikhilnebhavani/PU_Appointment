
import clientPromise from "../../../lib/mongodb";
var CryptoJS = require("crypto-js");

export async function POST(req) {
  try {
    const client = await clientPromise;
    const dab = client.db("PU_MEETING");
    const data = await req.json();
    const date=data.date;
    
    // const bytes = await CryptoJS.AES.decrypt(data.tokens, process.env.TOKEN_SECRET);
    // var originalText = bytes.toString(CryptoJS.enc.Utf8);
    // const email = JSON.parse(originalText);

    // const post = await dab.collection("users").findOne(
    //     {email:email,date:date}
    // );
    const post = ["done"];
    if (post) {
      return new Response(JSON.stringify({ post }), { status: 200 });
    }
    else {
      return new Response(JSON.stringify({ error: "Something Went Wrong" }), { status: 400 });
    }
  } catch (error) {
    return new Error(JSON.stringify(error));
  }
};