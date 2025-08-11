const express = require('express');
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");
const moment = require("moment-timezone");



router.post('/', async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    const { token } = data;
    const bytes = CryptoJS.AES.decrypt(token, process.env.TOKEN_SECRET);
    const email = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    const localDate = moment.tz("Asia/Kolkata");
    const meetings = await db.collection('meetings').find({
      $or: [
        { created_by: email },
        { approval: { $elemMatch: { email: email } } }
      ]
    }).toArray();
    if (meetings) {
      const slot = await db.collection("users").findOne({email})
      const dailyAvailability = slot.dailyAvailability;
      const name = slot.name;
      let my_slots = slot.my_slots;
      if(!my_slots){
        my_slots = [];
      }
      const today = localDate.format('YYYY-MM-DD');
      const tomorrow = localDate.add(1, 'days').format('YYYY-MM-DD');
      const nexttomorrow = localDate.add(1, 'days').format('YYYY-MM-DD');
      
      const todayData = await dailyAvailability.filter((availability) => availability.date === today);
      const tomorrowData = await dailyAvailability.filter((availability) => availability.date === tomorrow);
      const nexttomorrowData = await dailyAvailability.filter((availability) => availability.date === nexttomorrow);
      let slots, slots2, slots3;
      if(todayData.length>0){
        slots = await todayData[0].freeSlots || [];
      }
      else{
        slots =[]
      }
      if(tomorrowData.length>0){
        slots2 = await tomorrowData[0].freeSlots || [];
      }
      else{
        slots2 =[]
      }
      if(nexttomorrowData.length>0){
        slots3 = await nexttomorrowData[0].freeSlots || [];
      }
      else{
        slots3 =[]
      }



      if(slot){
        res.setHeader('Cache-Control', 'public, max-age=60');
        res.status(200).json({ meetings, email , slots, name, slots2, slots3, my_slots});
      }
      else{
        res.status(400).json({ error: "Free Slots Not Found" });
      }

    } else {
      res.status(400).json({ error: "Not Found Any Meetings" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error)
  }
});

module.exports = router;
