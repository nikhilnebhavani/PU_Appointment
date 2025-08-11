"use client";
import Image from "next/image";
import styles from "./page.module.css";
import Navbar from "../components/navbar/page";
import { signOut } from "next-auth/react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const moment = require("moment");
import styles1 from "./canpop.module.css";
import { addDays, format } from "date-fns";

const getCurrentWeek = () => {
  const today = moment(); // Current date
  const startOfWeek = today.clone().startOf("isoWeek"); // Start of the current week (Monday)
  const endOfWeek = today.clone().endOf("isoWeek"); // End of the current week (Sunday)

  const currentWeek = [];
  let day = startOfWeek;

  while (day <= endOfWeek) {
    let a = {
      date: day.format("YYYY-MM-DD"),
      day: day.format("dddd"),
      meetings: 0,
    };
    currentWeek.push(a);
    day = day.clone().add(1, "day");
  }

  return currentWeek;
};

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
  if (timeString) {
    // Split the time string into hours and minutes
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
  else {
    return ""
  }
}
function addTime(startTime, duration) {
  if (startTime && duration) {
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
  } else {
    return ""
  }
}


export default function Home() {

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const router = useRouter();
  const [token, setToken] = useState("");
  const [pending_meetings, setPendingMeetings] = useState([]);
  const [my_created_meetings, setMyCreatedMeetings] = useState([]);
  const [cancelled_meetings, setCancelledMeetings] = useState([]);
  const [today_meetings, setTodayMeetings] = useState([]);
  const [tomorrow_meetings, setTomorrowMeetings] = useState([]);
  const [next_tomorrow_meetings, setNextTomorrowMeetings] = useState([]);
  const [my_slots, setMySlots] = useState([]);
  const [upcoming_meetings, setUpComingMeetings] = useState([]);
  const [current_user, setCurrentUser] = useState("");
  const [reason, setReason] = useState("");
  const [cancel_meeting, setCancelMeeting] = useState({});
  const [currentWeek, setCurrentWeek] = useState([]);
  const [cancelpopup, setcancelpopup] = useState(false);
  const [rejectpopup, setRejectpopup] = useState(false);
  const [reschedulepopup, setReschedulePopUp] = useState(false);
  const [reschedulemeeeting, setReschuduleMeeting] = useState({
    duration: "",
    pre_buffer: "",
    post_buffer: "",
  });
  const today = new Date();
  const tomorrow = addDays(today, 1)
  const next_tomorrow = addDays(today, 2)
  const [m, setM] = useState();
  const [email, setEmail] = useState();
  const [username, setUserName] = useState("User");
  const [detail, setDetail] = useState([]);
  const [formattedTime, setFormattedTime] = useState("");
  const [time, setTime] = useState(
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0)
  );
  const [allowedTimes, setAllowedTimes] = useState([
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0), // 9:00 AM
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0), // 12:00 PM
    new Date(today.getFullYear(), today.getMonth(), today.getDate(), 15, 0), // 3:00 PM
  ]);
  const [date, setDate] = useState(() => {
    const formattedDate = today.toISOString().split("T")[0];
    return formattedDate;
  });
  const [specificDates, setDates] = useState([new Date()]);

  const [hide, show] = useState({
    dropdown1: true,
    dropdown2: false,
    dropdown3: false,
    dropdown4: false,
  });
  const [today_freeSlots, setTodayFreeSlots] = useState([]);

  const [tomorrow_freeSlots, setTomorrowFreeSlots] = useState([]);

  const [next_tomorrow_freeSlots, setNextTomorrowFreeSlots] = useState([]);



  const [option1, setOption1] = useState(0);
  const [option2, setOption2] = useState(0);

  let currentTime = moment();
  // 2 hour fixed 
  currentTime = currentTime.add(2, "hours")

  const view = (id) => {
    router.push(`/mymeeting/?${id}`);
  };

  const meetingsSet = (meetings = [], email) => {
    if (!Array.isArray(meetings)) {
      console.error("Invalid input: meetings should be an array.");
      return;
    }
    const today = getLocalDate();
    const Tomorrow = format(tomorrow, "yyyy-MM-dd")
    const Next_Tomorrow = format(next_tomorrow, "yyyy-MM-dd")
    const pending = [];
    const myCreated = [];
    const cancelled = [];
    const todayMeet = [];
    const upcoming = [];
    const TomorrowMeet = [];
    const NextTomorrowMeet = []

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
      if (meetingDate == Tomorrow) {
        TomorrowMeet.push(meeting);
      }
      if (meetingDate == Next_Tomorrow) {
        NextTomorrowMeet.push(meeting);
      }

      if (meeting.booked_by === email) {
        myCreated.push(meeting);
      }

      currentWeek.map((data) => {
        if (
          meeting.date === data.date &&
          (meeting.status == "Pending" || meeting.status == "Upcoming")
        ) {
          data.meetings = data.meetings + 1;
        }
      });
    });
    setPendingMeetings(pending);
    setMyCreatedMeetings(myCreated);
    setCancelledMeetings(cancelled);
    setTodayMeetings(todayMeet);
    setUpComingMeetings(upcoming);
    setTomorrowMeetings(TomorrowMeet);
    setNextTomorrowMeetings(NextTomorrowMeet);
  };

  useEffect(() => {
    const token = Cookies.get("token");
    // let token = "U2FsdGVkX19Wt5aeBgvPSEUlNJSRF8AziAiF8eWhFYQIQWJoS6F/m+Hqz2ODVNV3";
    // Cookies.set("token", token);
    setToken(token);
    if (token == undefined) {
      router.push("/login");
    }
    const fetchData = async () => {
      if (token != null) {
        const user = { token };
        try {
          const response = await fetch(`${apiUrl}/meetings`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=60"
            },
            body: JSON.stringify(user),
          });

          if (response.status != 200) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }

          const result = await response.json();
          setM(result.meetings);
          setEmail(result.email);
          setCurrentUser(result.email);
          setCurrentWeek(getCurrentWeek());
          setTodayFreeSlots(result.slots);
          setTomorrowFreeSlots(result.slots2);
          setNextTomorrowFreeSlots(result.slots3);
          setUserName(result.name);
          setMySlots(result.my_slots);
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

  useEffect(() => {
    meetingsSet(m, email);
  }, [currentWeek]);

  const approve = async (meeting) => {
    const user = { meeting, email: current_user };
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
      user_email: current_user,
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
    const user = { meeting, email: current_user, reason };
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
      user_email: current_user,
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
      user_email: current_user,
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

  useEffect(() => {
    const dates = detail.map((e) => new Date(e.date));
    setDates(dates);
  }, [detail]);

  useEffect(() => {
    const times = generateAllowedTimes(
      detail,
      date,
      reschedulemeeeting.duration,
      "00:15",
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
      user_email: current_user,
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

  


  return (
    <main className={styles.main}>
      <div className={styles.scroll}>
        <Navbar />
        <div className={styles.userline}>
          <p className={styles.user_name}>Hello {username}, </p>
          <p className={styles.today_date}>It's {format(today, "EEEE, dd MMM")}</p>
          <p className={styles.user_meeting}>
            {" "}
            Today, You Have{" "}
            {
              today_meetings.filter((meeting) => meeting.status === "Upcoming")
                .length
            }{" "}
            Upcoming Confirmed Appointments
          </p>
        </div>

        <div className={styles.mainsec}>
          <div className={styles.sch}>
            <div className={styles.buttons}>
              <button className={option1 == 0 ? styles.active_button : ""} onClick={() => {
                setOption1(0)
              }}>Today</button>
              <button className={option1 == 1 ? styles.active_button : ""} onClick={() => {
                setOption1(1)
              }}>Tommorrow</button>
              <button className={option1 == 2 ? styles.active_button : ""} onClick={() => {
                setOption1(2)
              }}>{format(next_tomorrow, 'dd MMM')}</button>
              <button className={option1 == 3 ? styles.active_button : ""} onClick={() => {
                setOption1(3)
              }}><Image src={"/calender.svg"} width={100} height={100} alt="" />This Week</button>
            </div>
            <div className={styles.line2}></div>
            <div className={styles.boxes}>
              {option1 == 0 && today_meetings.length == 0 && today_freeSlots.length == 0 && (<p className={styles.feedback}>No slots !</p>)}
              {option1 == 1 && tomorrow_meetings.length == 0 && tomorrow_freeSlots.length == 0 && (<p className={styles.feedback}>No slots !</p>)}
              {option1 == 2 && next_tomorrow_meetings.length == 0 && next_tomorrow_freeSlots.length == 0 && (<p className={styles.feedback}>No slots !</p>)}
              {option1 == 0 && today_freeSlots.map((e, index) => {
                return (
                  <div className={styles.freeSlots} key={index}>
                    <Image src={"/time-slot.svg"} width={100} height={100} alt="" />
                    <p>
                      From : {e.start} : To : {e.end}
                    </p>
                  </div>
                );
              })}
              {option1 == 1 && tomorrow_freeSlots.map((e, index) => {
                return (
                  <div className={styles.freeSlots} key={index}>
                    <Image src={"/time-slot.svg"} width={100} height={100} alt="" />
                    {/* <h4>Free Slot =</h4> */}
                    <p>
                      From : {e.start} : To : {e.end}
                    </p>
                  </div>
                );
              })}
              {option1 == 2 && next_tomorrow_freeSlots.map((e, index) => {
                return (
                  <div className={styles.freeSlots} key={index}>
                    <Image src={"/time-slot.svg"} width={100} height={100} alt="" />
                    {/* <h4>Free Slot =</h4> */}
                    <p>
                      From : {e.start} : To : {e.end}
                    </p>
                  </div>
                );
              })}
              {option1 == 0 && today_meetings.map((meeting) => {
                let same = false
                if (meeting.booked_by == current_user) {
                  same = true
                }
                let a = moment(meeting.time, "HH:mm")
                if (meeting.status == "Upcoming" || (meeting.status == "Pending" && a.isSameOrAfter(currentTime)) || (meeting.status == "Running")) {
                  let b = false
                  if (meeting.status == "Pending") {
                    meeting.approval.map((e) => {
                      if (e.email == current_user && e.approval != true) {
                        b = true
                      }
                    })
                  }
                  return (
                    <div className={styles.schedule} key={meeting._id}>
                      <div className={styles.sch_up}>
                        <div>
                          <p style={{ textTransform: "capitalize" }}><Image src={"/person.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_name : meeting.booked_by_name}</span></p>
                          <p><Image src={"/email.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to : meeting.booked_by}</span></p>
                          <p><Image src={"/phone.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_phone : meeting.booked_by_phone}</span></p>
                          <p className={styles.status} ><Image src={"/status.png"} width={100} height={100} alt="" /><span>{meeting.status}</span></p>
                        </div>
                        <div className={styles.dt_time}>
                          <p><Image src={"/calender2.svg"} width={100} height={100} alt="" /><span>{meeting.date}</span></p>
                          <p><Image src={"/clock2.svg"} width={100} height={100} alt="" /><span>{addTime(meeting.time, meeting.duration)}</span></p>
                          <p><Image src={"/time-slot.svg"} width={100} height={100} alt="" /><span>{convertTimeToText(meeting.duration)}</span></p>
                          <p><Image src={"/mode.png"} width={100} height={100} alt="" /><span>{meeting.mode}</span></p>
                        </div>
                      </div>
                      <div className={styles.sch_right}>
                        <button
                          className={styles.reschedulebtn}
                          onClick={() => {
                            view(meeting._id);
                          }}
                        >
                          View
                        </button>
                        {meeting.status == "Pending" && b && (
                          <>
                            <button
                              className={styles.rejectbtn}
                              onClick={() => {
                                setRejectpopup(true);
                                setCancelMeeting(meeting);
                              }}
                            >
                              Reject
                            </button>
                            <button
                              className={styles.approvebtn}
                              onClick={() => {
                                approve(meeting);
                              }}
                            >
                              Approve
                            </button>
                          </>


                        )}
                        {meeting.status == "Pending" && !b && (
                          <button
                            className={styles.cancelbtn}
                            onClick={() => {
                              setRejectpopup(true);
                              setCancelMeeting(meeting);
                            }}
                          >
                            Cancel Request
                          </button>
                        )}
                        {meeting.status == "Upcoming" && a.isSameOrAfter(currentTime) && (
                          <button
                            className={styles.cancelbtn}
                            onClick={() => {
                              setRejectpopup(true);
                              setCancelMeeting(meeting);
                            }}
                          >
                            Cancel
                          </button>
                        )}

                        {a.isSameOrAfter(currentTime) && (
                          <button
                            className={styles.reschedulebtn}
                            onClick={() => {
                              setReschedulePopUp(true);
                              setReschuduleMeeting(meeting);
                              rescheduleTimeAndDate();
                            }}
                          >
                            Reschedule
                          </button>)}
                      </div>

                    </div>
                  );
                }
              })}
              {option1 == 1 && tomorrow_meetings.map((meeting) => {
                let same = false

                if (meeting.booked_by == current_user) {
                  same = true
                }
                if (meeting.status == "Upcoming" || meeting.status == "Pending") {
                  let a = false
                  if (meeting.status == "Pending") {
                    meeting.approval.map((e) => {
                      if (e.email == current_user && e.approval != true) {
                        a = true
                      }
                    })
                  }

                  return (
                    <div className={styles.schedule} key={meeting._id}>
                      <div className={styles.sch_up}>
                        <div>
                          <p style={{ textTransform: "capitalize" }}><Image src={"/person.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_name : meeting.booked_by_name}</span></p>
                          <p><Image src={"/email.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to : meeting.booked_by}</span></p>
                          <p><Image src={"/phone.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_phone : meeting.booked_by_phone}</span></p>
                          <p className={meeting.status == "Upcoming" ? styles.status : styles.resch} ><Image src={"/status.png"} width={100} height={100} alt="" /><span>{meeting.status}</span></p>

                        </div>
                        <div className={styles.dt_time}>
                          <p><Image src={"/calender2.svg"} width={100} height={100} alt="" /><span>{meeting.date}</span></p>
                          <p><Image src={"/clock2.svg"} width={100} height={100} alt="" /><span>{addTime(meeting.time, meeting.duration)}</span></p>
                          <p><Image src={"/time-slot.svg"} width={100} height={100} alt="" /><span>{convertTimeToText(meeting.duration)}</span></p>
                          <p><Image src={"/mode.png"} width={100} height={100} alt="" /><span>{meeting.mode}</span></p>

                        </div>
                      </div>
                      <div className={styles.sch_right}>

                        <button
                          className={styles.reschedulebtn}
                          onClick={() => {
                            view(meeting._id);
                          }}
                        >
                          View
                        </button>
                        {meeting.status == "Pending" && a && (
                          <>
                            <button
                              className={styles.rejectbtn}
                              onClick={() => {
                                setRejectpopup(true);
                                setCancelMeeting(meeting);
                              }}
                            >
                              Reject
                            </button>
                            <button
                              className={styles.approvebtn}
                              onClick={() => {
                                approve(meeting);
                              }}
                            >
                              Approve
                            </button>
                          </>


                        )}
                        {meeting.status == "Pending" && !a && (
                          <button
                            className={styles.cancelbtn}
                            onClick={() => {
                              setRejectpopup(true);
                              setCancelMeeting(meeting);
                            }}
                          >
                            Cancel Request
                          </button>
                        )}
                        {meeting.status == "Upcoming" && (
                          <button
                            className={styles.cancelbtn}
                            onClick={() => {
                              setRejectpopup(true);
                              setCancelMeeting(meeting);
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          className={styles.reschedulebtn}
                          onClick={() => {
                            setReschedulePopUp(true);
                            setReschuduleMeeting(meeting);
                            rescheduleTimeAndDate();
                          }}
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
              {option1 == 2 && next_tomorrow_meetings.map((meeting) => {
                let same = false

                if (meeting.booked_by == current_user) {
                  same = true
                }
                if (meeting.status == "Upcoming" || meeting.status == "Pending") {
                  let a = false
                  if (meeting.status == "Pending") {
                    meeting.approval.map((e) => {
                      if (e.email == current_user && e.approval != true) {
                        a = true
                      }
                    })
                  }

                  return (
                    <div className={styles.schedule} key={meeting._id}>
                      <div className={styles.sch_up}>
                        <div>
                          <p style={{ textTransform: "capitalize" }}><Image src={"/person.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_name : meeting.booked_by_name}</span></p>
                          <p><Image src={"/email.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to : meeting.booked_by}</span></p>
                          <p><Image src={"/phone.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_phone : meeting.booked_by_phone}</span></p>
                          <p className={meeting.status == "Upcoming" ? styles.status : styles.resch} ><Image src={"/status.png"} width={100} height={100} alt="" /><span>{meeting.status}</span></p>

                        </div>
                        <div className={styles.dt_time}>
                          <p><Image src={"/calender2.svg"} width={100} height={100} alt="" /><span>{meeting.date}</span></p>
                          <p><Image src={"/clock2.svg"} width={100} height={100} alt="" /><span>{addTime(meeting.time, meeting.duration)}</span></p>
                          <p><Image src={"/time-slot.svg"} width={100} height={100} alt="" /><span>{convertTimeToText(meeting.duration)}</span></p>
                          <p><Image src={"/mode.png"} width={100} height={100} alt="" /><span>{meeting.mode}</span></p>

                        </div>
                      </div>
                      <div className={styles.sch_right}>

                        <button
                          className={styles.reschedulebtn}
                          onClick={() => {
                            view(meeting._id);
                          }}
                        >
                          View
                        </button>
                        {meeting.status == "Pending" && a && (
                          <>
                            <button
                              className={styles.rejectbtn}
                              onClick={() => {
                                setRejectpopup(true);
                                setCancelMeeting(meeting);
                              }}
                            >
                              Reject
                            </button>
                            <button
                              className={styles.approvebtn}
                              onClick={() => {
                                approve(meeting);
                              }}
                            >
                              Approve
                            </button>
                          </>


                        )}
                        {meeting.status == "Pending" && !a && (
                          <button
                            className={styles.cancelbtn}
                            onClick={() => {
                              setRejectpopup(true);
                              setCancelMeeting(meeting);
                            }}
                          >
                            Cancel Request
                          </button>
                        )}
                        {meeting.status == "Upcoming" && (
                          <button
                            className={styles.cancelbtn}
                            onClick={() => {
                              setRejectpopup(true);
                              setCancelMeeting(meeting);
                            }}
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          className={styles.reschedulebtn}
                          onClick={() => {
                            setReschedulePopUp(true);
                            setReschuduleMeeting(meeting);
                            rescheduleTimeAndDate();
                          }}
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
              {option1 == 3 && (
                <>
                  <div className={styles.selectdate}>
                    <div className={styles.date}>
                      <div className={styles.topdate}>
                        <p>
                          {currentWeek.length != 0
                            ? `${currentWeek[0].date} to ${currentWeek[6].date}`
                            : "No Data"}
                        </p>
                      </div>
                      <div className={styles.meetshow}>
                        {currentWeek.map((dataInfo, index) => (
                          <div className={styles.meetingdateselect} key={index}>
                            <p>{dataInfo.date}</p>
                            <div className={styles.meetingnum}>
                              <h2>{dataInfo.meetings}</h2>
                            </div>
                            <p>{dataInfo.day}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* <div className={styles.final_status}>
                    <h2>Total Meeting's Status</h2>

                    <div className={styles.finalbar}>
                      <div className={styles.finalnum}>
                        <div className={styles.finalmeetnum}>
                          <h2>{upcoming_meetings.length}</h2>
                        </div>
                        <p>Upcoming</p>
                      </div>
                      <div className={styles.finalnum}>
                        <div className={styles.finalmeetnum}>
                          <h2>{pending_meetings.length}</h2>
                        </div>
                        <p>Pending</p>
                      </div>
                      <div className={styles.finalnum}>
                        <div className={styles.finalmeetnum}>
                          <h2>{cancelled_meetings.length}</h2>
                        </div>
                        <p>Cancel</p>
                      </div>
                    </div>
                  </div> */}
                </>
              )}

            </div>
          </div>



          <div className={styles.sch}>
            <div className={styles.buttons}>
              <button className={option2 == 0 ? styles.active_button : ""} onClick={() => {
                setOption2(0)
              }}>Pending</button>
              <button className={option2 == 1 ? styles.active_button : ""} onClick={() => {
                setOption2(1)
              }}>My Requested</button>
              <button className={option2 == 3 ? styles.active_button : ""} onClick={() => {
                setOption2(3)
              }}>Cancelled</button>
            </div>
            <div className={styles.line2}></div>
            <div className={styles.boxes}>
              {option2 == 0 && pending_meetings.length == 0 && (<p className={styles.feedback}>No slots !</p>)}
              {option2 == 1 && my_created_meetings.length == 0 && (<p className={styles.feedback}>No slots !</p>)}
              {option2 == 3 && cancelled_meetings.length == 0 && (<p className={styles.feedback}>No slots !</p>)}


              {option2 == 0 && pending_meetings.map((meeting) => {
                let same = false

                if (meeting.booked_by == current_user) {
                  same = true
                }
                let a = false
                if (meeting.status == "Pending") {
                  meeting.approval.map((e) => {
                    if (e.email == current_user && e.approval != true) {
                      a = true
                    }
                  })
                  if (a) {


                    return (
                      <div className={styles.schedule} key={meeting._id}>
                        <div className={styles.sch_up}>
                          <div>
                            <p style={{ textTransform: "capitalize" }}><Image src={"/person.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_name : meeting.booked_by_name}</span></p>
                            <p><Image src={"/email.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to : meeting.booked_by}</span></p>
                            <p><Image src={"/phone.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_phone : meeting.booked_by_phone}</span></p>
                            <p className={meeting.status == "Upcoming" ? styles.status : styles.resch} ><Image src={"/status.png"} width={100} height={100} alt="" /><span>{meeting.status}</span></p>

                          </div>
                          <div className={styles.dt_time}>
                            <p><Image src={"/calender2.svg"} width={100} height={100} alt="" /><span>{meeting.date}</span></p>
                            <p><Image src={"/clock2.svg"} width={100} height={100} alt="" /><span>{addTime(meeting.time, meeting.duration)}</span></p>
                            <p><Image src={"/time-slot.svg"} width={100} height={100} alt="" /><span>{convertTimeToText(meeting.duration)}</span></p>
                            <p><Image src={"/mode.png"} width={100} height={100} alt="" /><span>{meeting.mode}</span></p>

                          </div>
                        </div>
                        <div className={styles.sch_right}>

                          <button
                            className={styles.reschedulebtn}
                            onClick={() => {
                              view(meeting._id);
                            }}
                          >
                            View
                          </button>
                          <button
                            className={styles.rejectbtn}
                            onClick={() => {
                              setRejectpopup(true);
                              setCancelMeeting(meeting);
                            }}
                          >
                            Reject
                          </button>
                          <button
                            className={styles.approvebtn}
                            onClick={() => {
                              approve(meeting);
                            }}
                          >
                            Approve
                          </button>

                          <button
                            className={styles.reschedulebtn}
                            onClick={() => {
                              setReschedulePopUp(true);
                              setReschuduleMeeting(meeting);
                              rescheduleTimeAndDate();
                            }}
                          >
                            Reschedule
                          </button>
                        </div>
                      </div>
                    );
                  }

                }
              })}

              {option2 == 1 && my_created_meetings.map((meeting) => {
                let same = false

                if (meeting.booked_by == current_user) {
                  same = true
                }
                if (meeting.status == "Upcoming" || meeting.status == "Pending") {
                  let a = false
                  if (meeting.status == "Pending") {
                    meeting.approval.map((e) => {
                      if (e.email == current_user && e.approval == true) {
                        a = true
                      }
                    })
                  }
                  if(a){


                  return (
                    <div className={styles.schedule} key={meeting._id}>
                      <div className={styles.sch_up}>
                        <div>
                          <p style={{ textTransform: "capitalize" }}><Image src={"/person.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_name : meeting.booked_by_name}</span></p>
                          <p><Image src={"/email.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to : meeting.booked_by}</span></p>
                          <p><Image src={"/phone.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_phone : meeting.booked_by_phone}</span></p>
                          <p className={meeting.status == "Upcoming" ? styles.status : styles.resch} ><Image src={"/status.png"} width={100} height={100} alt="" /><span>{meeting.status}</span></p>

                        </div>
                        <div className={styles.dt_time}>
                          <p><Image src={"/calender2.svg"} width={100} height={100} alt="" /><span>{meeting.date}</span></p>
                          <p><Image src={"/clock2.svg"} width={100} height={100} alt="" /><span>{addTime(meeting.time, meeting.duration)}</span></p>
                          <p><Image src={"/time-slot.svg"} width={100} height={100} alt="" /><span>{convertTimeToText(meeting.duration)}</span></p>
                          <p><Image src={"/mode.png"} width={100} height={100} alt="" /><span>{meeting.mode}</span></p>

                        </div>
                      </div>
                      <div className={styles.sch_right}>

                        <button
                          className={styles.reschedulebtn}
                          onClick={() => {
                            view(meeting._id);
                          }}
                        >
                          View
                        </button>
                        
                          <button
                            className={styles.cancelbtn}
                            onClick={() => {
                              setRejectpopup(true);
                              setCancelMeeting(meeting);
                            }}
                          >
                            {meeting.status == "Pending" ? "Cancel Request" :"Cancel" }
                          </button>
                       
                        <button
                          className={styles.reschedulebtn}
                          onClick={() => {
                            setReschedulePopUp(true);
                            setReschuduleMeeting(meeting);
                            rescheduleTimeAndDate();
                          }}
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  );
                }

                }
              })}

              {option2 == 3 && cancelled_meetings.map((meeting) => {
                let same = false

                if (meeting.booked_by == current_user) {
                  same = true
                }
                if (meeting.status == "Cancelled") {
                  let a = false
                  if (meeting.status == "Pending") {
                    meeting.approval.map((e) => {
                      if (e.email == current_user && e.approval != true) {
                        a = true
                      }
                    })
                  }

                  return (
                    <div className={styles.schedule} key={meeting._id}>
                      <div className={styles.sch_up}>
                        <div>
                          <p style={{ textTransform: "capitalize" }}><Image src={"/person.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_name : meeting.booked_by_name}</span></p>
                          <p><Image src={"/email.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to : meeting.booked_by}</span></p>
                          <p><Image src={"/phone.svg"} width={100} height={100} alt="" /><span>{same ? meeting.booked_to_phone : meeting.booked_by_phone}</span></p>
                          <p className={meeting.status == "Upcoming" ? styles.status : styles.resch} ><Image src={"/status.png"} width={100} height={100} alt="" /><span>{meeting.status}</span></p>

                        </div>
                        <div className={styles.dt_time}>
                          <p><Image src={"/calender2.svg"} width={100} height={100} alt="" /><span>{meeting.date}</span></p>
                          <p><Image src={"/clock2.svg"} width={100} height={100} alt="" /><span>{addTime(meeting.time, meeting.duration)}</span></p>
                          <p><Image src={"/time-slot.svg"} width={100} height={100} alt="" /><span>{convertTimeToText(meeting.duration)}</span></p>
                          <p><Image src={"/mode.png"} width={100} height={100} alt="" /><span>{meeting.mode}</span></p>

                        </div>
                      </div>
                      <div className={styles.sch_right}>

                        <button
                          className={styles.reschedulebtn}
                          onClick={() => {
                            view(meeting._id);
                          }}
                        >
                          View
                        </button>

                        <button
                          className={styles.reschedulebtn}
                          onClick={() => {
                            setReschedulePopUp(true);
                            setReschuduleMeeting(meeting);
                            rescheduleTimeAndDate();
                          }}
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  );
                }
              })}





            </div>
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
                  <p style={{ textTransform: "capitalize" }}><Image src={"/person.svg"} width={100} height={100} alt="" /><span>{cancel_meeting.booked_by == current_user ? cancel_meeting.booked_to_name : cancel_meeting.booked_by_name}</span></p>
                  <p><Image src={"/email.svg"} width={100} height={100} alt="" /><span>{cancel_meeting.booked_by == current_user ? cancel_meeting.booked_to : cancel_meeting.booked_by}</span></p>
                  <p><Image src={"/phone.svg"} width={100} height={100} alt="" /><span>{cancel_meeting.booked_by == current_user ? cancel_meeting.booked_to_phone : cancel_meeting.booked_by_phone}</span></p>
                  <p className={cancel_meeting.status == "Upcoming" ? styles.status : styles.resch} ><Image src={"/status.png"} width={100} height={100} alt="" /><span>{cancel_meeting.status}</span></p>
                </div>

                <div className={styles1.dt}>
                  <p><Image src={"/calender2.svg"} width={100} height={100} alt="" />{cancel_meeting.date}</p>
                  <p><Image src={"/clock2.svg"} width={100} height={100} alt="" />{addTime(cancel_meeting.time, cancel_meeting.duration)}</p>
                  <p><Image src={"/time-slot.svg"} width={100} height={100} alt="" />{convertTimeToText(cancel_meeting.duration)}</p>
                  <p><Image src={"/mode.png"} width={100} height={100} alt="" />{cancel_meeting.mode}</p>
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
                  Conform
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
        {rejectpopup && (
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
                      setRejectpopup(false);
                    }}
                  />
                </button>
              </div>
              <div className={styles1.head}>
                <h2>Reject Meeting : </h2>
                <p>ID: {cancel_meeting._id}</p>
              </div>
              <div className={styles1.detail}>
                <div className={styles1.nd}>
                  <p style={{ textTransform: "capitalize" }}><Image src={"/person.svg"} width={100} height={100} alt="" /><span>{cancel_meeting.booked_by == current_user ? cancel_meeting.booked_to_name : cancel_meeting.booked_by_name}</span></p>
                  <p><Image src={"/email.svg"} width={100} height={100} alt="" /><span>{cancel_meeting.booked_by == current_user ? cancel_meeting.booked_to : cancel_meeting.booked_by}</span></p>
                  <p><Image src={"/phone.svg"} width={100} height={100} alt="" /><span>{cancel_meeting.booked_by == current_user ? cancel_meeting.booked_to_phone : cancel_meeting.booked_by_phone}</span></p>
                  <p className={cancel_meeting.status == "Upcoming" ? styles.status : styles.resch} ><Image src={"/status.png"} width={100} height={100} alt="" /><span>{cancel_meeting.status}</span></p>
                </div>

                <div className={styles1.dt}>
                  <p><Image src={"/calender2.svg"} width={100} height={100} alt="" />{cancel_meeting.date}</p>
                  <p><Image src={"/clock2.svg"} width={100} height={100} alt="" />{addTime(cancel_meeting.time, cancel_meeting.duration)}</p>
                  <p><Image src={"/time-slot.svg"} width={100} height={100} alt="" />{convertTimeToText(cancel_meeting.duration)}</p>
                  <p><Image src={"/mode.png"} width={100} height={100} alt="" />{cancel_meeting.mode}</p>
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
                    setRejectpopup(false);
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
                  <p style={{ textTransform: "capitalize" }}><Image src={"/person.svg"} width={100} height={100} alt="" /><span>{reschedulemeeeting.booked_by == current_user ? reschedulemeeeting.booked_to_name : reschedulemeeeting.booked_by_name}</span></p>
                  <p><Image src={"/email.svg"} width={100} height={100} alt="" /><span>{reschedulemeeeting.booked_by == current_user ? reschedulemeeeting.booked_to : reschedulemeeeting.booked_by}</span></p>
                  <p><Image src={"/phone.svg"} width={100} height={100} alt="" /><span>{reschedulemeeeting.booked_by == current_user ? reschedulemeeeting.booked_to_phone : reschedulemeeeting.booked_by_phone}</span></p>
                  <p className={reschedulemeeeting.status == "Upcoming" ? styles.status : styles.resch} ><Image src={"/status.png"} width={100} height={100} alt="" /><span>{reschedulemeeeting.status}</span></p>
                </div>

                <div className={styles1.dt}>
                  <p><Image src={"/calender2.svg"} width={100} height={100} alt="" />{reschedulemeeeting.date}</p>
                  <p><Image src={"/clock2.svg"} width={100} height={100} alt="" />{addTime(reschedulemeeeting.time, reschedulemeeeting.duration)}</p>
                  <p><Image src={"/time-slot.svg"} width={100} height={100} alt="" />{convertTimeToText(reschedulemeeeting.duration)}</p>
                  <p><Image src={"/mode.png"} width={100} height={100} alt="" />{reschedulemeeeting.mode}</p>
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
                  Conform
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


      </div>
    </main>
  );
}
