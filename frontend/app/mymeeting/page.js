"use client";
import styles from "./my_meeting.module.css";
import Navbar from "../../components/navbar/page";
import Image from "next/image";
import Cookies from "js-cookie";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import styles1 from "../canpop.module.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const moment = require("moment");

function mergeFreeSlots(freeSlots) {
  if (!freeSlots || freeSlots.length === 0) return [];

  // Sort free slots by start time
  freeSlots.sort((a, b) =>
    moment(a.start, "HH:mm").diff(moment(b.start, "HH:mm"))
  );

  const mergedSlots = [freeSlots[0]];

  for (let i = 1; i < freeSlots.length; i++) {
    const lastMergedSlot = mergedSlots[mergedSlots.length - 1];
    const currentSlot = freeSlots[i];

    if (
      moment(lastMergedSlot.end, "HH:mm").isSameOrAfter(
        moment(currentSlot.start, "HH:mm")
      )
    ) {
      // Merge slots
      lastMergedSlot.end = moment
        .max(
          moment(lastMergedSlot.end, "HH:mm"),
          moment(currentSlot.end, "HH:mm")
        )
        .format("HH:mm");
    } else {
      // No overlap, push current slot
      mergedSlots.push(currentSlot);
    }
  }

  return mergedSlots;
}

function generateAllowedTimes(
  datesAndtimes,
  selectedDate,
  meetingDuration,
  preBuffer,
  postBuffer
) {
  const entry = datesAndtimes.find((e) => e.date === selectedDate);
  if (!entry) return [];

  const mergedSlots = mergeFreeSlots(entry.freeSlots);

  const allowedTimes = [];
  const durationMinutes = moment.duration(meetingDuration).asMinutes();
  const preBufferMinutes = moment.duration(preBuffer).asMinutes();
  const postBufferMinutes = moment.duration(postBuffer).asMinutes();
  const totalMeetingTime =
    durationMinutes + preBufferMinutes + postBufferMinutes;
  console.log(totalMeetingTime);

  mergedSlots.forEach((slot) => {
    let slotStart = moment(slot.start, "HH:mm");
    const slotEnd = moment(slot.end, "HH:mm");

    while (
      slotStart.clone().add(totalMeetingTime, "minutes").isSameOrBefore(slotEnd)
    ) {
      console.log(
        slotStart
          .clone()
          .add(totalMeetingTime, "minutes")
          .isSameOrBefore(slotEnd)
      );
      const meetingStart = slotStart.clone().add(preBufferMinutes, "minutes");
      allowedTimes.push(meetingStart.toDate());
      slotStart.add(15, "minutes");
    }
  });

  return allowedTimes;
}
function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function convertTimeToText(timeString) {
  if(timeString){
  const [hours, minutes] = timeString.split(':').map(Number);

  let result = '';

  // Handle hours part
  if (hours > 0) {
    result += `${hours} hr${hours > 1 ? 's' : ''}`;
  }

  // Handle minutes part
  if (minutes > 0) {
    if (result.length > 0) result += ' ';
    result += `${minutes} min`;
  }

  // If it's 00:00, return 0 min
  if (!result) {
    result = '0 min';
  }

  return result;
}
else{
  return ""
}
}
function addTime(startTime, duration) {
  if(startTime && duration){
  // Split the startTime and duration into hours and minutes
  let [startHours, startMinutes] = startTime.split(':').map(Number);
  let [durationHours, durationMinutes] = duration.split(':').map(Number);

  // Add minutes and handle overflow
  let endMinutes = startMinutes + durationMinutes;
  let extraHours = Math.floor(endMinutes / 60);
  endMinutes = endMinutes % 60;

  // Add hours and handle overflow
  let endHours = startHours + durationHours + extraHours;
  endHours = endHours % 24; // Keep the hours within 24

  // Format the time back to "HH:mm"
  const formattedEndHours = endHours.toString().padStart(2, '0');
  const formattedEndMinutes = endMinutes.toString().padStart(2, '0');

  return `${startTime} to ${formattedEndHours}:${formattedEndMinutes}`;
  }
  else{
    return ""
  }
}

export default function mymeeting() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const [m, setM] = useState([]);
  const [email, setEmail] = useState();
  const [meeting, setMeeting] = useState({});
  const [option, setOption] = useState("all");
  const [pending_meetings, setPendingMeetings] = useState([]);
  const [my_created_meetings, setMyCreatedMeetings] = useState([]);
  const [cancelled_meetings, setCancelledMeetings] = useState([]);
  const [today_meetings, setTodayMeetings] = useState([]);
  const [upcoming_meetings, setUpComingMeetings] = useState([]);
  const id = useSearchParams();
  const [cancelpopup, setcancelpopup] = useState(false);
  const [cancel_meeting, setCancelMeeting] = useState({});
  const [reason, setReason] = useState("");
  const [reschedulepopup, setReschedulePopUp] = useState(false);
  const [reschedulemeeeting, setReschuduleMeeting] = useState({
    duration: "",
    pre_buffer: "",
    post_buffer: "",
  });
  const today = new Date();

  const [date, setDate] = useState(() => {
    const formattedDate = today.toISOString().split("T")[0];
    return formattedDate;
  });
  const [specificDates, setDates] = useState([new Date()]);
  const [formattedTime, setFormattedTime] = useState("");
  const [detail, setDetail] = useState([]);

  useEffect(() => {
    // const token = "U2FsdGVkX18syn4QG3yPL/RFHZg77mvehfwyGd/i/YJuuuA+5kqjmotNOocwsg8y"
    const token = Cookies.get("token");
    const fetchData = async () => {
      if (token != null) {
        const user = { token };
        try {
          const response = await fetch(`${apiUrl}/meetings`, {
            // const response = await fetch("http://172.20.10.14:3001/meetings", {

            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
          });

          if (response.status != 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();
          setM(result.meetings);
          setEmail(result.email);
          screenWidth>600 ? setMeeting(result.meetings[0])  :""
        } catch (error) {
          alert(error);
        }
      }
    };
    fetchData();
    const intervalId = setInterval(() => {
      fetchData();
    }, 60000);
  
    return () => clearInterval(intervalId);
  }, []);
  const [time, setTime] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0)
  );
  const [allowedTimes, setAllowedTimes] = useState([
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), // 9:00 AM
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0), // 12:00 PM
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), // 3:00 PM
  ]);
  const [pending_a, setA] = useState(false);
  const [meeting_popup, setMPopup] = useState(false);

  useEffect(() => {
    if (id != "") {
      m.map((e) => {
        if (e._id + "=" == id) {
          setMeeting(e);
          setMPopup(true)
        }
      });
    }
    else{
      setMeeting(m[0])
    }
  }, [id, m]);

  useEffect(() => {
    meetingsSet(m, email);
  }, [m]);

  const meetingsSet = (meetings = [], email) => {
    if (!Array.isArray(meetings)) {
      console.error("Invalid input: meetings should be an array.");
      return;
    }
    const today = getLocalDate();
    console.log(today);
    const pending = [];
    const myCreated = [];
    const cancelled = [];
    const todayMeet = [];
    const upcoming = [];

    meetings.forEach((meeting) => {
      if (meeting.status === "Pending") {
        pending.push(meeting);
      } else if (meeting.status === "Cancelled") {
        cancelled.push(meeting);
      } else if (meeting.status === "Upcoming") {
        upcoming.push(meeting);
      }

      const meetingDate = meeting.date.split("T")[0];

      if (meetingDate === today) {
        todayMeet.push(meeting);
      }

      if (meeting.booked_by === email) {
        myCreated.push(meeting);
      }
    });
    setPendingMeetings(pending);
    setMyCreatedMeetings(myCreated);
    setCancelledMeetings(cancelled);
    setTodayMeetings(todayMeet);
    setUpComingMeetings(upcoming);
  };

  useEffect(() => {
    setA(false);
    if (meeting && Array.isArray(meeting.approval)) {
      meeting.approval.forEach((e) => {
        if (e.email === email && e.approval) {
          setA(true);
        }
      });
    }
  }, [meeting]);

  useEffect(() => {
    const dates = detail.map((e) => new Date(e.date));
    setDates(dates);
  }, [detail]);

  useEffect(() => {
    const times = generateAllowedTimes(
      detail,
      date,
      reschedulemeeeting.duration,
      reschedulemeeeting.pre_buffer,
      reschedulemeeeting.post_buffer
    );
    setAllowedTimes(times);
  }, [date, detail]);

  useEffect(() => {
    setTime(allowedTimes[0]);
    setFormattedTime(
      allowedTimes[0] ? moment(allowedTimes[0]).format("HH:mm") : ""
    );
  }, [allowedTimes]);
  
  const rescheduleTimeAndDate = async () => {
    try {
      const response = await fetch(`${apiUrl}/rescheduleDateTime`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      if (response.status != 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result) {
        setDetail(result.datesAndtimes);
      }
    } catch (error) {
      alert(error);
    }
  };

  const rescheduleMeeeting = async () => {
    const user = {
      meeting: reschedulemeeeting,
      date,
      time: formattedTime,
      email,
    };
    try {
      const response = await fetch(`${apiUrl}/reschedule_meeting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        RescheduleEmail();
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (error) {
      alert(error);
    }
  };
  const RescheduleEmail = async () => {
    const user = {
      email_type: "reschedule",
      user_email: email,
      date: reschedulemeeeting.date,
      time: reschedulemeeeting.time,
      booked_by: {
        email: reschedulemeeeting.booked_by,
        name: reschedulemeeeting.booked_by_name,
        phone: reschedulemeeeting.booked_by_phone,
      },
      detail: reschedulemeeeting.detail,
      new_time: formattedTime,
      new_date: date,
      approval: reschedulemeeeting.approval,
    };

    try {
      const response = await fetch(`${apiUrl}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
      } else {
        const err = await response.json();
        console.log(err);
      }
    } catch (error) {
      alert(error);
    }
  };

  const approve = async (meeting) => {
    const user = { meeting, email };
    try {
      const response = await fetch(`${apiUrl}/approve_meeting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status != 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result) {
        if (result.approval) {
          ApproveEmail(meeting);
          alert("Your Meeting Scheduled Successfully.");
          window.location.reload();
        } else {
          alert(
            `sorry ! there are no free slots for this meeting in ${result.name} schedule `
          );
        }
      }
    } catch (error) {
      alert(error);
    }
  };
  const ApproveEmail = async (meeting) => {
    const user = {
      email_type: "approve",
      user_email: email,
      date: meeting.date,
      time: meeting.time,
      booked_by: {
        email: meeting.booked_by,
        name: meeting.booked_by_name,
        phone: meeting.booked_by_phone,
      },
      detail: meeting.detail,
      new_time: formattedTime,
      new_date: date,
      approval: meeting.approval,
    };

    try {
      const response = await fetch(`${apiUrl}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
      } else {
        const err = await response.json();
        console.log(err);
      }
    } catch (error) {
      alert(error);
    }
  };

  const cancel = async (meeting) => {
    const user = { meeting, email, reason };
    try {
      const response = await fetch(`${apiUrl}/cancel_meeting`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status != 200) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      if (result) {
        if (meeting.status == "Pending") {
          RejectEmail(meeting, reason);
        } else {
          CancelEmail(meeting, reason);
        }
        window.location.reload();
      }
    } catch (error) {
      alert(error);
    }
  };

  const CancelEmail = async (meeting, reason) => {
    const user = {
      email_type: "cancel",
      user_email: email,
      date: meeting.date,
      time: meeting.time,
      booked_by: {
        email: meeting.booked_by,
        name: meeting.booked_by_name,
        phone: meeting.booked_by_phone,
      },
      detail: meeting.detail,
      reason,
      approval: meeting.approval,
    };
    try {
      const response = await fetch(`${apiUrl}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (error) {
      alert(error);
    }
  };

  const RejectEmail = async (meeting, reason) => {
    const user = {
      email_type: "reject",
      user_email: email,
      date: meeting.date,
      time: meeting.time,
      booked_by: {
        email: meeting.booked_by,
        name: meeting.booked_by_name,
        phone: meeting.booked_by_phone,
      },
      detail: meeting.detail,
      reason,
      approval: meeting.approval,
    };
    try {
      const response = await fetch(`${apiUrl}/email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
      } else {
        const err = await response.json();
        alert(err.error);
      }
    } catch (error) {
      alert(error);
    }
  };

  return (
    <main className={styles.main}>
      <Navbar className={styles.nav} />
      <div className={styles.maincontainer}>
        <div className={styles.fcontainer}>
          <div className={styles.head}>
            <p>My Meetings</p>
          </div>
          <div className={styles.line}>
            <hr></hr>
          </div>
          <div className={styles.dn}>
            <select
              name="Todays Schedule"
              onChange={(e) => {
                setOption(e.target.value);
                if (e.target.value == "today" && today_meetings.length != 0 && screenWidth>600) {
                  setMeeting(today_meetings[0]);
                } else if (
                  e.target.value == "upcoming" &&
                  upcoming_meetings.length != 0
                  && screenWidth>600
                ) {
                  setMeeting(upcoming_meetings[0]);
                } else if (
                  e.target.value == "cancel" &&
                  cancelled_meetings.length != 0
                  && screenWidth>600
                ) {
                  setMeeting(cancelled_meetings[0]);
                } else if (
                  e.target.value == "mine" &&
                  my_created_meetings.length != 0
                  && screenWidth>600
                ) {
                  setMeeting(my_created_meetings[0]);
                } else if (
                  e.target.value == "pending" &&
                  pending_meetings.length != 0
                  && screenWidth>600
                ) {
                  setMeeting(pending_meetings[0]);
                } else {
                  if(screenWidth>600){
                    setMeeting(m[0]);
                  }
                }
              }}
            >
              <option selected={option == "all" ? true : false} value={"all"}>
                All Meetings
              </option>
              <option
                selected={option == "today" ? true : false}
                value={"today"}
              >
                Today’s Meetings
              </option>
              <option
                selected={option == "upcoming" ? true : false}
                value={"upcoming"}
              >
                Upcoming meetings
              </option>
              <option
                selected={option == "pending" ? true : false}
                value={"pending"}
              >
                Pending Meetings
              </option>
              <option selected={option == "mine" ? true : false} value={"mine"}>
                My Created Meetings
              </option>
              <option
                selected={option == "cancel" ? true : false}
                value={"cancel"}
              >
                Cancelled Meetings
              </option>
            </select>
            <Image
              width={100}
              height={100}
              src="/dropdownicon.png"
              alt="dropdownicon"
            ></Image>
          </div>

          <div className={styles.mdetails}>
            {option == "all" &&
              m.map((e) => {
                return (
                  <div
                    className={styles.fmeeting}
                    style={
                      e == meeting
                        ? {
                            background: "black",
                            color: "white",
                            transform: "scale(1.1)",
                          }
                        : {}
                    }
                    onClick={() => {
                      setMeeting(e);
                      screenWidth<600 ? setMPopup(true) : ""
                    }}
                  >
                    <div className={styles.detail}>
                      <p>
                        <Image
                          src={"/person.svg"}
                          width={100}
                          height={100}
                          alt=""
                          style={
                            e == meeting
                              ? {
                                  background: "white"
                                }
                              : {}
                          }
                        />
                        {email==e.booked_by ? e.booked_to_name : e.booked_by_name}
                      </p>
                      <div className={styles.bdetail}>
                        <div className={styles.d1}>
                          <p>
                            <Image
                              src={"/calender2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {e.date}
                          </p>
                        </div>
                        <div className={styles.d2}>
                          <p>
                            <Image
                              src={"/clock2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {addTime(e.time, e.duration)}
                          </p>
                        </div>
                        <div className={styles.d3}>
                          <p>
                            <Image
                              src={"/time-slot.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {convertTimeToText(e.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {option == "today" &&
              today_meetings.map((e) => {
                return (
                  <div
                    className={styles.fmeeting}
                    style={
                      e == meeting
                        ? {
                            background: "black",
                            color: "white",
                            transform: "scale(1.1)",
                          }
                        : {}
                    }
                    onClick={() => {
                      setMeeting(e);
                      screenWidth<600 ? setMPopup(true) : ""
                    }}
                  >
                    <div className={styles.detail}>
                      <p>
                        <Image
                          src={"/person.svg"}
                          width={100}
                          height={100}
                          alt=""
                          style={
                            e == meeting
                              ? {
                                  background: "white"
                                }
                              : {}
                          }
                        />
                        {email==e.booked_by ? e.booked_to_name : e.booked_by_name}

                      </p>
                      <div className={styles.bdetail}>
                        <div className={styles.d1}>
                          <p>
                            <Image
                              src={"/calender2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {e.date}
                          </p>
                        </div>
                        <div className={styles.d2}>
                          <p>
                            <Image
                              src={"/clock2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {addTime(e.time, e.duration)}
                          </p>
                        </div>
                        <div className={styles.d3}>
                          <p>
                            <Image
                              src={"/time-slot.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {convertTimeToText(e.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
               {option == "mine" &&
              my_created_meetings.map((e) => {
                return (
                  <div
                    className={styles.fmeeting}
                    style={
                      e == meeting
                        ? {
                            background: "black",
                            color: "white",
                            transform: "scale(1.1)",
                          }
                        : {}
                    }
                    onClick={() => {
                      setMeeting(e);
                      screenWidth<600 ? setMPopup(true) : ""
                    }}
                  >
                    <div className={styles.detail}>
                      <p>
                        <Image
                          src={"/person.svg"}
                          width={100}
                          height={100}
                          alt=""
                          style={
                            e == meeting
                              ? {
                                  background: "white"
                                }
                              : {}
                          }
                        />
                        {email==e.booked_by ? e.booked_to_name : e.booked_by_name}
                      </p>
                      <div className={styles.bdetail}>
                        <div className={styles.d1}>
                          <p>
                            <Image
                              src={"/calender2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {e.date}
                          </p>
                        </div>
                        <div className={styles.d2}>
                          <p>
                            <Image
                              src={"/clock2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {addTime(e.time, e.duration)}
                          </p>
                        </div>
                        <div className={styles.d3}>
                          <p>
                            <Image
                              src={"/time-slot.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {convertTimeToText(e.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
               {option == "cancel" &&
              cancelled_meetings.map((e) => {
                return (
                  <div
                    className={styles.fmeeting}
                    style={
                      e == meeting
                        ? {
                            background: "black",
                            color: "white",
                            transform: "scale(1.1)",
                          }
                        : {}
                    }
                    onClick={() => {
                      setMeeting(e);
                      screenWidth<600 ? setMPopup(true) : ""
                    }}
                  >
                    <div className={styles.detail}>
                      <p>
                        <Image
                          src={"/person.svg"}
                          width={100}
                          height={100}
                          alt=""
                          style={
                            e == meeting
                              ? {
                                  background: "white"
                                }
                              : {}
                          }
                        />
                        {email==e.booked_by ? e.booked_to_name : e.booked_by_name}
                      </p>
                      <div className={styles.bdetail}>
                        <div className={styles.d1}>
                          <p>
                            <Image
                              src={"/calender2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {e.date}
                          </p>
                        </div>
                        <div className={styles.d2}>
                          <p>
                            <Image
                              src={"/clock2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {addTime(e.time, e.duration)}
                          </p>
                        </div>
                        <div className={styles.d3}>
                          <p>
                            <Image
                              src={"/time-slot.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {convertTimeToText(e.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
               {option == "upcoming" &&
              upcoming_meetings.map((e) => {
                return (
                  <div
                    className={styles.fmeeting}
                    style={
                      e == meeting
                        ? {
                            background: "black",
                            color: "white",
                            transform: "scale(1.1)",
                          }
                        : {}
                    }
                    onClick={() => {
                      setMeeting(e);
                      screenWidth<600 ? setMPopup(true) : ""
                    }}
                  >
                    <div className={styles.detail}>
                      <p>
                        <Image
                          src={"/person.svg"}
                          width={100}
                          height={100}
                          alt=""
                          style={
                            e == meeting
                              ? {
                                  background: "white"
                                }
                              : {}
                          }
                        />
                        {email==e.booked_by ? e.booked_to_name : e.booked_by_name}
                      </p>
                      <div className={styles.bdetail}>
                        <div className={styles.d1}>
                          <p>
                            <Image
                              src={"/calender2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {e.date}
                          </p>
                        </div>
                        <div className={styles.d2}>
                          <p>
                            <Image
                              src={"/clock2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {addTime(e.time, e.duration)}
                          </p>
                        </div>
                        <div className={styles.d3}>
                          <p>
                            <Image
                              src={"/time-slot.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {convertTimeToText(e.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
               {option == "pending" &&
              pending_meetings.map((e) => {
                return (
                  <div
                    className={styles.fmeeting}
                    style={
                      e == meeting
                        ? {
                            background: "black",
                            color: "white",
                            transform: "scale(1.1)",
                          }
                        : {}
                    }
                    onClick={() => {
                      setMeeting(e);
                      screenWidth<600 ? setMPopup(true) : ""
                    }}
                  >
                    <div className={styles.detail}>
                      <p>
                        <Image
                          src={"/person.svg"}
                          width={100}
                          height={100}
                          alt=""
                          style={
                            e == meeting
                              ? {
                                  background: "white"
                                }
                              : {}
                          }
                        />
                        {email==e.booked_by ? e.booked_to_name : e.booked_by_name}
                      </p>
                      <div className={styles.bdetail}>
                        <div className={styles.d1}>
                          <p>
                            <Image
                              src={"/calender2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {e.date}
                          </p>
                        </div>
                        <div className={styles.d2}>
                          <p>
                            <Image
                              src={"/clock2.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {addTime(e.time, e.duration)}
                          </p>
                        </div>
                        <div className={styles.d3}>
                          <p>
                            <Image
                              src={"/time-slot.svg"}
                              width={100}
                              height={100}
                              alt=""
                              style={
                                e == meeting
                                  ? {
                                      background: "white"
                                    }
                                  : {}
                              }
                            />
                            {convertTimeToText(e.duration)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className={styles.scontainer} style={meeting_popup && screenWidth<600 ? {top:"5vh"} : {}}>
          {meeting && (
            <div className={styles.nextcontainer}>
              <div className={styles.bar}>
                <p>Meeting Information</p>
                {screenWidth<600 ? <button onClick={()=>{setMPopup(false)}}>X</button> : <></>}
              </div>
              <div className={styles.info}>
              <div className={styles.box}>
                  <label>Name </label>
                  <input
                    type="text"
                    value={email==meeting.booked_by ? meeting.booked_to_name || "" : meeting.booked_by_name}
                    readOnly={true}
                  />
              </div>
              <div className={styles.box}>
                  <label>Email </label>
                  <input
                    type="text"
                    value={email==meeting.booked_by ? meeting.booked_to || "" : meeting.booked_by}
                    readOnly={true}
                  />
              </div>
              <div className={styles.box}>
                  <label>Phone </label>
                  <input
                    type="text"
                    value={email==meeting.booked_by ? meeting.booked_to_phone || "" : meeting.booked_by_phone}
                    readOnly={true}
                  />
              </div>
              <div className={styles.box}>
                  <label>Date </label>
                  <input
                    type="text"
                    value={meeting.date}
                    readOnly={true}
                  />
              </div>
              <div className={styles.box}>
                  <label>Time</label>
                  <input
                    type="text"
                    value={addTime(meeting.time, meeting.duration)}
                    readOnly={true}
                  />
              </div>
              <div className={styles.box}>
                  <label>Duration </label>
                  <input
                    type="text"
                    value={convertTimeToText(meeting.duration)}
                    readOnly={true}
                  />
              </div>
              <div className={styles.box}>
                  <label>Mode </label>
                  <input
                    type="text"
                    value={meeting.mode}
                    readOnly={true}
                  />
              </div>
              <div className={styles.box}>
                  <label>Status</label>
                  <input
                    type="text"
                    style={meeting.status=="Upcoming"||meeting.status=="Completed" ? {color:"blue"} : meeting.status=="Pending" ? {color: "#ff7300"} :  {color : "red"}}
                    value={meeting.status}
                    readOnly={true}
                  />
              </div>
              
              <div className={styles.box}>
                  <label>Detail </label>
                  <textarea
                    type="text"
                    value={meeting.detail}
                    readOnly={true}
                  />
              </div>

              </div>
              {meeting.status == "Pending" && pending_a ? (
                <div className={styles.buttons}>
                  <p className={styles.fbullet}>Waiting for Response</p>
                </div>
              ) : meeting.status == "Pending" ? (
                <div className={styles.buttons}>
                  <button
                    style={{ background: "green", color: "white" }}
                    onClick={() => {
                      approve(meeting);
                    }}
                  >
                    Approve
                  </button>{" "}
                  <button
                    style={{ background: "red", color: "white" }}
                    onClick={() => {
                      setcancelpopup(true);
                      setCancelMeeting(meeting);
                    }}
                  >
                    Reject
                  </button>{" "}
                  <button
                    style={{ background: "blue", color: "white" }}
                    onClick={() => {
                      setReschedulePopUp(true);
                      setReschuduleMeeting(meeting);
                      rescheduleTimeAndDate();
                    }}
                  >
                    Reschedule
                  </button>
                </div>
              ) : meeting.status == "Cancelled" ? (
                <div className={styles.buttons}>
                  <button
                    style={{ background: "blue", color: "white" }}
                    onClick={() => {
                      setReschedulePopUp(true);
                      setReschuduleMeeting(meeting);
                      rescheduleTimeAndDate();
                    }}
                  >
                    Reschedule
                  </button>
                </div>
              ) : meeting.date == getLocalDate() ? (
                <></>
              ) : meeting.status == "Completed" ? (
                <></>
              ) : (
                <div className={styles.buttons}>
                  <button
                    style={{ background: "red", color: "white" }}
                    onClick={() => {
                      setcancelpopup(true);
                      setCancelMeeting(meeting);
                    }}
                  >
                    Cancel
                  </button>{" "}
                  <button
                    style={{ background: "blue", color: "white" }}
                    onClick={() => {
                      setReschedulePopUp(true);
                      setReschuduleMeeting(meeting);
                      rescheduleTimeAndDate();
                    }}
                  >
                    Reschedule
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
 
      {cancelpopup && (
        <div className={styles1.cancelpopup}>
          <div className={styles1.popup}>
            <div className={styles1.close}>
              <button id="close">
                <Image
                  width={1000}
                  height={1000}
                  src="/close.png"
                  alt="close"
                  onClick={() => {
                    setcancelpopup(false);
                  }}
                />
              </button>
            </div>
            <div className={styles1.head}>
              <h2>Confirm Cancellation</h2>
              <p>ID: {cancel_meeting._id}</p>
            </div>
            <div className={styles1.detail}>
            <div className={styles1.nd}>
                    <p style={{textTransform : "capitalize"}}><Image src={"/person.svg"} width={100} height={100} alt=""/><span>{cancel_meeting.booked_by==email ? cancel_meeting.booked_to_name : cancel_meeting.booked_by_name}</span></p>
                    <p><Image src={"/email.svg"} width={100} height={100} alt=""/><span>{cancel_meeting.booked_by==email ? cancel_meeting.booked_to : cancel_meeting.booked_by}</span></p>
                    <p><Image src={"/phone.svg"} width={100} height={100} alt=""/><span>{cancel_meeting.booked_by==email ? cancel_meeting.booked_to_phone : cancel_meeting.booked_by_phone}</span></p>
                    <p className={cancel_meeting.status=="Upcoming" ? styles.status : styles.resch} ><Image src={"/status.png"} width={100} height={100} alt=""/><span>{cancel_meeting.status}</span></p>
                </div>

                <div className={styles1.dt}>
                  <p><Image src={"/calender2.svg"} width={100} height={100} alt=""/>{cancel_meeting.date}</p>
                  <p><Image src={"/clock2.svg"} width={100} height={100} alt=""/>{addTime(cancel_meeting.time, cancel_meeting.duration)}</p>
                  <p><Image src={"/time-slot.svg"} width={100} height={100} alt=""/>{convertTimeToText(cancel_meeting.duration)}</p>
                  <p><Image src={"/mode.png"} width={100} height={100} alt=""/>{cancel_meeting.mode}</p>
                </div>
            </div>

            <div className={styles1.line}>
              <hr></hr>
            </div>
            <div className={styles1.res}>
              <p>Reason</p>
              <div className={styles1.inbox}>
                <textarea
                  rows="5"
                  cols="60 name=description"
                  onChange={(e) => {
                    setReason(e.target.value);
                  }}
                ></textarea>
              </div>
            </div>

            <div className={styles1.btn}>
              <button
                className={styles1.conbtn}
                onClick={() => {
                  cancel(cancel_meeting);
                }}
              >
                Confirm
              </button>
              <button
                className={styles1.canbtn}
                onClick={() => {
                  setcancelpopup(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {reschedulepopup && (
        <div className={styles1.cancelpopup}>
          <div className={styles1.popup}>
            <div className={styles1.close}>
              <button id="close">
                <Image
                  width={1000}
                  height={1000}
                  src="/close.png"
                  alt="close"
                  onClick={() => {
                    setReschedulePopUp(false);
                  }}
                />
              </button>
            </div>
            <div className={styles1.head}>
              <h2>Confirm Reschedule</h2>
              <p>ID: {reschedulemeeeting._id}</p>
            </div>
            <div className={styles1.detail}>
            <div className={styles1.nd}>
                <p style={{textTransform : "capitalize"}}><Image src={"/person.svg"} width={100} height={100} alt=""/><span>{reschedulemeeeting.booked_by==email ? reschedulemeeeting.booked_to_name : reschedulemeeeting.booked_by_name}</span></p>
                    <p><Image src={"/email.svg"} width={100} height={100} alt=""/><span>{reschedulemeeeting.booked_by==email ? reschedulemeeeting.booked_to : reschedulemeeeting.booked_by}</span></p>
                    <p><Image src={"/phone.svg"} width={100} height={100} alt=""/><span>{reschedulemeeeting.booked_by==email ? reschedulemeeeting.booked_to_phone : reschedulemeeeting.booked_by_phone}</span></p>
                    <p className={reschedulemeeeting.status=="Upcoming" ? styles.status : styles.resch} ><Image src={"/status.png"} width={100} height={100} alt=""/><span>{reschedulemeeeting.status}</span></p>
                </div>

                <div className={styles1.dt}>
                <p><Image src={"/calender2.svg"} width={100} height={100} alt=""/>{reschedulemeeeting.date}</p>
                  <p><Image src={"/clock2.svg"} width={100} height={100} alt=""/>{addTime(reschedulemeeeting.time, reschedulemeeeting.duration)}</p>
                  <p><Image src={"/time-slot.svg"} width={100} height={100} alt=""/>{convertTimeToText(reschedulemeeeting.duration)}</p>
                  <p><Image src={"/mode.png"} width={100} height={100} alt=""/>{reschedulemeeeting.mode}</p>       
                </div>
            </div>

            <div className={styles1.line}>
              <hr></hr>
            </div>
            <div className={styles1.resD}>
              <DatePicker
                id="datePicker"
                selected={date}
                onChange={(date) => {
                  const formattedDate = date.toISOString().split("T")[0];
                  setDate(formattedDate);
                }}
                dateFormat="yyyy-MM-dd"
                minDate={today}
                includeDates={specificDates}
                className={styles1.DatePicker}
              />
              <DatePicker
                id="timePicker"
                selected={time}
                onChange={(time) => {
                  setTime(time);
                  setFormattedTime(moment(time).format("HH:mm"));
                }}
                showTimeSelect
                showTimeSelectOnly
                includeTimes={allowedTimes}
                timeIntervals={15}
                timeCaption="Time"
                timeFormat="HH:mm"
                dateFormat="HH:mm"
                className={styles1.DatePicker}
              />
            </div>

            <div className={styles1.btn}>
              <button
                className={styles1.conbtn}
                onClick={() => {
                  rescheduleMeeeting();
                }}
              >
                Confirm
              </button>
              <button
                className={styles1.canbtn}
                onClick={() => {
                  setReschedulePopUp(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
