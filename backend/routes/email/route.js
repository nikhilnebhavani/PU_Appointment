const express = require("express");
const router = express.Router();
const clientPromise = require("../../lib/mongodb");
const CryptoJS = require("crypto-js");
const moment = require("moment-timezone");


const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "testappointment@paruluniversity.ac.in",
    pass: "PUmeeting@18",
  },
});

const sendEmail = (to, subject, text, id) => {
  const localDate = moment.tz("Asia/Kolkata");

  const mailOptions = {
    from: "testappointment@paruluniversity.ac.in",
    to: to,
    subject: subject,
    text: text,
    headers: {
      'Message-ID': `<${localDate}@yourdomain.com>`
    }
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log(localDate + " Email sent: " + info.response);
  });
  return true;
};

router.post("/", async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("PU_MEETING");
    const data = req.body;
    let { email_type, tokens, date, time, booked_by, detail, user_email, booked_to, mode } = data;
    let subject;
    let text;
    let name, a;
    const localDate = moment.tz("Asia/Kolkata");
    if(booked_by==undefined){
      booked_by = {name:""}
    }


    if(booked_by.name==""){
      const user = await db.collection("users").findOne({email:booked_by.email})
      if(user){
        booked_by.name=user.name
      }
      else{
        booked_by.name = "Unknown"
      }
    }

    if (email_type=="cancel"){

      let approval = data.approval;

      let reason = data.reason;

      if(user_email == booked_by.email){
        approval.map((e)=>{
          if(e.email!=user_email){
            booked_by.email = e.email
          }
        })
        const user = await db.collection("users").findOne({ email:booked_by.email });
        if (user) {
          booked_by.name = user.name;
        }
        else{
          booked_by.name = user_email
        }
      }
      
      const user = await db.collection("users").findOne({ email:user_email });
      if (user) {
        name = user.name;
      }

      subject = `Your Meeting Has Been Canceled - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Dear ${booked_by.name};
  
We regret to inform you that your scheduled meeting has been canceled. Please find the details of the canceled meeting below:


- Meeting with: ${name}
- Date: ${date}
- Time: ${time}
- Agenda: ${detail}

- Reason of Rejection : ${reason}

If you have any questions or need to reschedule the meeting, please visit our website or contact us directly. We apologize for any inconvenience this may cause.

Thank you for using our meeting scheduling service.

Best regards,
PU Meetings`;

      a = sendEmail(booked_by.email, subject, text);

      subject = `Confirmation of Meeting Cancellation - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Dear ${name},

This is to confirm that you have successfully canceled the meeting with ${booked_by.name}. Below are the details of the canceled meeting:s

- Meeting with: ${booked_by.name}
- Date: ${date}
- Time: ${time}
- Agenda: ${detail}

- Reason: ${reason}

If you canceled this meeting by mistake or would like to reschedule, please visit our website to make the necessary changes.

Thank you for using our meeting scheduling service.

Thank you,
PU Meetings`;

      a = sendEmail(user_email, subject, text);
    }
    else if (email_type=="reject"){
      let approval = data.approval;
      
      let reason = data.reason;

      if(user_email == booked_by.email){
        approval.map((e)=>{
          if(e.email!=user_email){
            booked_by.email = e.email
          }
        })
        const user = await db.collection("users").findOne({ email:booked_by.email });
        if (user) {
          booked_by.name = user.name;
        }
        else{
          booked_by.name = user_email
        }
      }
      
      const user = await db.collection("users").findOne({ email:user_email });
      if (user) {
        name = user.name;
      }

      subject = `Your Meeting Request Has Been Rejected - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Dear ${booked_by.name};
  
Thank you for using our meeting scheduling service. Unfortunately, your meeting request has been rejected. Please find the details of your request below:

- Meeting with: ${name}
- Date: ${date}
- Time: ${time}
- Agenda: ${detail}

- Reason of Rejection : ${reason}

If you need any help, please visit our website.

Best regards,
PU Meetings`;

      a = sendEmail(booked_by.email, subject, text);

      subject = `You Have Rejected a Meeting Request - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Dear ${name},

This is to confirm that you have successfully rejected the meeting request from ${booked_by.name}. Below are the details of the rejected request:

- Meeting with: ${booked_by.name}
- Date: ${date}
- Time: ${time}
- Agenda: ${detail}

- Reason: ${reason}

If you have rejected this request by mistake or need to take further action, please visit our website to make the necessary changes.

Thank you for using our meeting scheduling service.

Thank you,
PU Meetings`;

      a = sendEmail(user_email, subject, text);
    }
    else if (email_type=="reschedule"){
      let new_time = data.new_time;
      let new_date = data.new_date;
      let approval = data.approval;

      if(user_email == booked_by.email){
        approval.map((e)=>{
          if(e.email!=user_email){
            booked_by.email = e.email
          }
        })
        const user = await db.collection("users").findOne({ email:booked_by.email });
        if (user) {
          booked_by.name = user.name;
        }
        else{
          booked_by.name = user_email
        }
      }

      const user = await db.collection("users").findOne({ email:user_email });
      if (user) {
        name = user.name;
      }
      else{
        name = user_email
      }
      

      subject = `Request to Reschedule Meeting - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Dear ${booked_by.name};
  
We would like to inform you that a request has been made to reschedule your upcoming meeting. Please find the details of the original meeting and the proposed new schedule below:

Original Meeting Details:
- Meeting with: ${name}
- Date: ${date}
- Time: ${time}
- Agenda: ${detail}

Proposed New Schedule:
- New Date: ${new_date}
- New Time: ${new_time}

If the new schedule works for you, approve from our website. However, if you would like to propose a different time or date, please visit our website to make the necessary adjustments.

We apologize for any inconvenience caused and appreciate your understanding.

Thank you for using our meeting scheduling service.

Best regards,
PU Meetings`;

      a = sendEmail(booked_by.email, subject, text);

      subject = `Your Meeting Reschedule Request Has Been Processed - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Dear ${name},

We have successfully processed your request to reschedule the meeting with ${booked_by.name}. Please find the updated meeting details below:

Updated Meeting Schedule:
- Meeting with: ${booked_by.name}
- New Date:${new_date}
- New Time: ${new_time}
- Agenda: ${detail}

If you need to make any further changes or have any questions, please feel free to visit our website or contact us directly.

Thank you for using our meeting scheduling service. We appreciate your cooperation.


Thank you,
PU Meetings`;

      a = sendEmail(user_email, subject, text);
    }
    else if (email_type=="approve"){
      let approval = data.approval;

      if(user_email == booked_by.email){
        approval.map((e)=>{
          if(e.email!=user_email){
            booked_by.email = e.email
          }
        })
        const user = await db.collection("users").findOne({ email:booked_by.email });
        if (user) {
          booked_by.name = user.name;
        }
        else{
          booked_by.name = user_email
        }
      }

      const user = await db.collection("users").findOne({ email:user_email });
      if (user) {
        name = user.name;
      }
      else{
        name = user_email
      }

      subject = `Your Meeting Request Has Been Approved - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Dear ${booked_by.name};
  
We are pleased to inform you that your meeting request has been approved. Please find the details of the confirmed meeting below:

- Meeting with: ${name}
- Date: ${date}
- Time: ${time}
- Agenda: ${detail}


Your meeting has been successfully scheduled. If you need to make any changes or cancel the meeting, please visit our website.

Thank you for using our meeting scheduling service. We look forward to facilitating a productive meeting.

Best regards,
PU Meetings`;

      a = sendEmail(booked_by.email, subject, text);

      subject = `Confirmation of Meeting Approval - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Dear ${name},

This is to confirm that you have successfully approved the meeting request from ${booked_by.name}. Please find the details of the approved meeting below:

- Meeting with: ${booked_by.name}
- Date:${date}
- Time: ${time}
- Agenda: ${detail}

If you need to make any further changes or cancel the meeting, please visit our website to update the meeting details.

Thank you for using our meeting scheduling service.


Thank you,
PU Meetings`;

      a = sendEmail(user_email, subject, text);
    }
    else if (email_type == "request") {

      subject = `Your Meeting Request Has Been Sent - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Dear ${booked_by.name};
  
Thank you for using our meeting scheduling service. Your meeting request has been successfully sent. Please find the details of your request below:

- Meeting with: ${booked_to.member_name}
- Date: ${date}
- Time: ${time}
- Mode: ${mode}
- Detail: ${detail}

We will notify you once ${booked_to.member_name} responds to your request. If you need to make any changes or cancel the request, please visit our website.

Best regards,
PU Meetings`;
      a = sendEmail(booked_by.email, subject, text);

      subject = `New Meeting Request from ${booked_by.name} - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Dear ${booked_to.member_name},

You have received a new meeting request from ${booked_by.name}. Please find the details of the request below:

- Meeting with: ${booked_by.name}
- Date: ${date}
- Time: ${time}
- Mode: ${mode}
- Detail: ${detail}

Please confirm or decline this meeting request at your earliest convenience by visiting our website.

Thank you,
PU Meetings`;
      a = sendEmail(booked_to.member_email, subject, text);
    }
    else if(email_type == "new_user"){
      
      const bytes = CryptoJS.AES.decrypt(tokens, process.env.TOKEN_SECRET);
      const originalText = bytes.toString(CryptoJS.enc.Utf8);
      const email= JSON.parse(originalText);
      const user = await db.collection("users").findOne({ email });
      let name,number, department, role, institue;
      if (user) {
        name = user.name;
        number = user.number;
        department = user.department;
        role = user.position;
        institue = user.position;
      }

      subject = `New User Request - ${localDate.format('YYYY-MM-DD HH:mm:ss')}`;
      text = `Hello There,
  
New user make request to use parul appointment service.

- Name: ${name}
- Email: ${email}
- Mobile: ${number}
- Role: ${role}
- Institute: ${institue}
- Department: ${department}

Best regards,
PU Meetings`;

      const admins = await db.collection("users").find({ level: 2 }).toArray();
      admins.map((e)=>{
        a = sendEmail(e.email, subject, text);
      })

    }
    else{
      console.log("no email")
    }
    

    if (a) {
      res.status(200).json("OK");
    } else {
      res.status(400).json({ error: "Not Send" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error)
  }
});

module.exports = router;
