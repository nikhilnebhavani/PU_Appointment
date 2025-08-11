const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");

router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;

    const bytes = CryptoJS.AES.decrypt(data.tokens, process.env.TOKEN_SECRET);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    const email = JSON.parse(originalText);

    const post = await db.collection("users").findOne({ email });
    if (post) {
      res.status(200).json({ post });
    } else {
      res.status(400).json({ error: "Something Went Wrong" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
