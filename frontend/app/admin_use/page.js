"use client";
import Image from "next/image";
import styles from "./head.module.css";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/navbar/page";

export default function Login() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const session = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [menu, setMenu] = useState(0);
  const [users, setUsers] = useState([]);
  const [copyUsers, setCopyUsers] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [userEmail, setUserEmail] = useState("");


  useEffect(() => {
    const token = Cookies.get("token");
    console.log(session.status);
    if (session.status === "authenticated" && token) {
     setEmail(session.data.user.email)
    }
  });

  useEffect(()=>{
    if(email!=""){
      check(email)
    }
  },[email])

  const check = async (email) => {
    const user = { email };
    try {
      const response = await fetch(`${apiUrl}/check_admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if (response.status === 200) {
        const result = await response.json();
        if(result.level < 2){
          alert(result.level)
          router.push("/");
        }
        else{
          fetchData()
        }
      } else {
        alert("nt found")
        router.push("/");
      }
    } catch (error) {
      alert("error")
      router.push("/");
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch(`${apiUrl}/get_admin_data`, { method: "GET" });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
  
      const result = await response.json();
      if(result){
        setUsers(result.users)
        setCopyUsers(result.users)
        setMeetings(result.meetings)
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      alert(`An error occurred: ${error.message}`);
    }
  };

  const handleApprove = async (e) => {
    const user = { email:e};
    try {
      const response = await fetch(`${apiUrl}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        alert("Data is Updated");
        window.location.reload();
      } else {
        const err = await response.json();
        alert("ok"+err.error);
      }
    } catch (error) {
      alert("2" + error);
    }
  };

  const handleLevel = async (level) => {
    const user = { email:userEmail, level};
    try {
      const response = await fetch(`${apiUrl}/level`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        alert("Data is Updated");
        window.location.reload();
      } else {
        const err = await response.json();
        alert("ok"+err.error);
      }
    } catch (error) {
      alert("2" + error);
    }
  };

  const handleDelete = async (email) => {
    const user = { email};
    try {
      const response = await fetch(`${apiUrl}/user_delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      if (response.status === 200) {
        alert("Data is Updated");
        window.location.reload();
      } else {
        const err = await response.json();
        alert("ok"+err.error);
      }
    } catch (error) {
      alert("2" + error);
    }
  };



  return (
    <main className={styles.main}>
        <Navbar />
        <div className={styles.menu}>
          <button className={menu==0 ? styles.active : ""} onClick={()=>{setMenu(0)}}>New Requests</button>  
          <button className={menu==1 ? styles.active : ""} onClick={()=>{setMenu(1)}}>Users</button>  
          <button className={menu==2 ? styles.active : ""} onClick={()=>{setMenu(2)}}>Meetings</button>  
        </div>
        <div className={styles.boxdiv}>
          {menu==0 && users.map((user)=>(!user.active ? 
          <div className={styles.box}>
            <p>Name : {user.name}</p>
            <p>Email : {user.email}</p>
            <p>Phone : {user.number}</p>
            <p>Institute : {user.institute}</p>
            <p>Department : {user.department}</p>
            <p>Position : {user.position}</p>
            <button style={{background:"green"}} onClick={()=>{handleApprove(user.email)}}>Approve</button>
            <button>Delete</button>
          </div> 
          
          : <></>))}   

          {menu==1 && users.map((user)=>(user.active ? 
          <div className={styles.box}>
            <p>Name : {user.name}</p>
            <p>Email : {user.email}</p>
            <p>Phone : {user.number}</p>
            <p>Institute : {user.institute}</p>
            <p>Department : {user.department}</p>
            <p>Position : {user.position}</p>
            <p>Type  : <select value={user.level} onChange={(e)=>{
              setUserEmail(user.email);
              let newLevel = Number(e.target.value);
              
              const updatedUsers = users.map((e) =>
                e._id === user._id ? { ...e, level: newLevel } : e
              );
              setUsers(updatedUsers);
            }}>
              <option value={0}>{"normal"}</option>
              <option  value={1}>{"elite"}</option>
              <option  value={2}>{"admin"}</option>
              <option value={3}>{"super"}</option>
              </select></p>
            <button onClick={()=>{
              const confirmChange = window.confirm(`Are you sure you want to delete user ${user.name}?`);
              if(confirmChange){
                handleDelete(user.email)
              }
              }}>Delete</button>
            
            {userEmail==user.email && (<button style={{background:"green"}} onClick={()=>{handleLevel(user.level)}}>Save</button>)}
            {userEmail==user.email && (<button onClick={()=>{
              setUserEmail("")
              setUsers(copyUsers)
            }}>Cancel</button>)}

          </div> 
          
          : <></>))}

          {menu==2 && meetings.map((meeting)=>(
            
            <div className={styles.box}>
              <p>Booked By Name : {meeting.booked_by_name}</p>
              <p>Booked To Name : {meeting.booked_to_name}</p>
              <p>Booked By Email : {meeting.booked_by}</p>
              <p>Booked To Email : {meeting.booked_to}</p>
              <p>Booked By Phone : {meeting.booked_by_phone}</p>
              <p>Booked To Phone : {meeting.booked_to_phone}</p>
              <p>Meeting Date : {meeting.date}</p>
              <p>Meeting Time : {meeting.time}</p>
              <p>Meeting Duration : {meeting.duration}</p>
              <p>Meeting Details : {meeting.detail}</p>
            </div> 
            ))}

        </div>
    </main>
  );
}


