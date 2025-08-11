const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const client = await clientPromise;
    const db = client.db("PU_MEETING");

    const bytes = CryptoJS.AES.decrypt(data.token, process.env.TOKEN_SECRET);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    const user_data = JSON.parse(originalText);

    const user = await db.collection("users").findOneAndUpdate(
      { email: user_data },
      { $set: { name: data.name, number: data.number, department: data.department, position:data.role, institute: data.institute } },
      { returnDocument: 'after' }
    );

    if (user) {
      const token = CryptoJS.AES.encrypt(JSON.stringify(user.value), process.env.TOKEN_SECRET).toString();
      res.status(200).json(token);
    } else {
      res.status(400).json(user_data);
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

module.exports = router;
