const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");

const DatesAndTimes = (details) => {
  let data = []
  details.forEach(e => {
    let a = {date: e.date, freeSlots: e.freeSlots};
    data.push(a);
  });

  return data
}

router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const token = data.tokens;
    const bytes = CryptoJS.AES.decrypt(token, process.env.TOKEN_SECRET);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    const email = JSON.parse(originalText);

    const post = await db.collection("users").findOne({ email });
    if (post) {
      let services = post.services
      const data = await db.collection("users").find({}).toArray();
      const level = post.level
      const datesAndtimes = DatesAndTimes(post.dailyAvailability);
      const name = post.name;
      const phone = post.number;
      let filteredData = data.filter(e => e.email !== email);

      if (level==0) {
        filteredData = filteredData.filter(item => item.level != 3);
      }

      let f =[]
      filteredData.map((e)=>{
        f.push({
          id:e._id,
          name:e.name,
          email:e.email,
          number:e.number,
          datesAndtimes:DatesAndTimes(e.dailyAvailability)
        })
      })

      filteredData = f
      
      res.status(200).json({a:filteredData, services, datesAndtimes , name, phone, email} )

    } else {
      res.status(400).json({ error: email, token:token });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;


