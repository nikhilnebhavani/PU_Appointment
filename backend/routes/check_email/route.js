const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");

router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { email } = data;

    const user = await db.collection("users").findOne({ email: email });
    if (user) {
      let name = user.name
      let phone = user.number
      let dailyAvailability = user.dailyAvailability
      let extra_hours =user.extra_hours
      res.status(200).json({ name, phone, dailyAvailability, extra_hours });
    } else {
      res.status(400).json({ error: "Email Already Logged In" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
