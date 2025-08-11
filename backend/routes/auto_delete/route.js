const express = require("express");
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");


router.post("/", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const meetingsCollection = db.collection('meetings');

    const date30DaysAgo = new Date();
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    const cutoffDateString = date30DaysAgo.toISOString().split('T')[0];

    const result = await meetingsCollection.deleteMany({
      date: { $lt: cutoffDateString }
    });
    
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ error: "Meetings not Found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
