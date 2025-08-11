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

    const user = await db.collection("users").findOne({ email });
    if (user) {
      const token = CryptoJS.AES.encrypt(JSON.stringify(email), process.env.TOKEN_SECRET).toString();
      res.status(200).json({ token });
    } else {
      res.status(400).json({ error: "Email Not Found" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
