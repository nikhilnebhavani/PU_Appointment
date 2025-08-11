const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");

router.get('/', async (req, res) => { // Include req here
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");

    const meetings = await db.collection('meetings').find({}).toArray();
    const users = await db.collection('users').find({}).toArray();

    res.status(200).json({ meetings, users });
  } catch (error) {

    console.error(error); 
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
