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

    const post = await db.collection("users").findOne({ email: data.email });
    if (post) {
      const datesAndtimes = DatesAndTimes(post.dailyAvailability);
      res.status(200).json( {datesAndtimes} );
    } else {
      res.status(400).json({ error: "Something Went Wrong" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
