const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");

router.post('/', async (req, res) => {
  try {
    const data = req.body;
    const client = await clientPromise;
    const db = client.db("PU_MEETING");

    const user = await db.collection("users").findOneAndUpdate(
      { email: data.email },
      { $set: { active : true } }
    );

    if (user) {
      res.status(200).json("ok");
    } else {
      res.status(400).json(user_data);
    }
  } catch (error) {
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
});

module.exports = router;
