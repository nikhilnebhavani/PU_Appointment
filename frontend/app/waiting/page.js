"use client";
import styles from "./wait.module.css";

import Navbar from "../../components/navbar/page";
import { useRouter } from "next/navigation";


export default function Login() {
  const router = useRouter()
  return (
    <main className={styles.main}>
      <Navbar/>
      <h1>Your Registeration is completed ! waiting for admin aprroval.... </h1>
      <button onClick={()=>{
        router.push("/")
      }}> Refresh </button>
    </main>
  );
}


