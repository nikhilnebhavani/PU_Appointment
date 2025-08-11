const express = require("express");
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");


router.post("/", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { duration, date, time, booked_by, detail, booked_to, mode } = data;

    function extractStartTime(timeRange) {
      const [startTime] = timeRange.split(" to ");
      return startTime;
    }
    
    
    const post = await db
      .collection("meetings")
      .insertOne({
        duration,
        date,
        time:extractStartTime(time),
        booked_by_name: booked_by.name,
        booked_by_phone: booked_by.phone,
        booked_by: booked_by.email,
        booked_to:booked_to.member_email,
        booked_to_name:booked_to.member_name,
        booked_to_phone:booked_to.member_phone,
        detail,
        approval:[
          {email:booked_by.email, approval:true },
          {email:booked_to.member_email, approval:false },
        ],
        status: "Pending",
        mode,
      });

    if (post) {
      res.status(200).json({ id: post.insertedId  });
    } else {
      res.status(400).json({ error: "Something Went Wrong" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error)
  }
});

module.exports = router;
