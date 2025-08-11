"use client"
import Image from "next/image";
import styles from "./about.module.css";
import Navbar from  '../../components/navbar/page';
import { useRouter } from "next/navigation";


export default function About() {
  const router = useRouter();

  const handlehome = () =>{
      router.push('/');
   };

  return (
    <main className={styles.main}>
      <Navbar/>
      <div className={styles.obj}>
          <div className={styles.title1}><h2>About us</h2></div>
          <p>Welcome to PU Meetings - Simplifying Scheduling, Empowering Efficiency!</p> 
      </div>
      <div className={styles.obj1}>
          <div className={styles.objwri}>
            <div className={styles.title}><h2>Our Mission :</h2></div>
            <p>At PU meetings, we are dedicated to revolutionizing the way to individuals manage their schedules.
              Our mission is to provide a seamless and user-friendly online scheduling platform that enhances productivity, saves time,
              and fosters better connections.</p>
          </div>
          <div className={styles.objimg}>
            <Image width={1000} height={1000} src="/pugate.png" alt="parul gate" />
          </div>
      </div>
      <div className={styles.obj2}>
          <div className={styles.title}><h2>What Sets Us Apart:</h2></div>
          <p><b>User-Friendly Interface: </b>We prioritize simplicity and ease of use in our platform, ensuring that users can navigate the scheduling process effortlessly.<br/>
           <br></br> <b>Customization: </b>Our online scheduling system is designed to be flexible, allowing their scheduling preferences and meet the unique needs of their operations. <br/>
            <br/><b>Reliability: </b>We understand the importance of reliability in scheduling. Our platform is robust and secure, ensuring that appointments and bookings are managed with precision. <br/>
            <br/><b>Innovation: </b>We stay ahead of the curve by incorporating the latest technological advancements, ensuring that our platform evolves with the changing needs of our users.</p>
      </div>
      <div className={styles.obj3}>
        <div className={styles.obj3img}>
            <Image width={1000} height={1000} src="/aboutus_img2.png" alt="parul gate" />
          </div>
          <div className={styles.obj3wri}>
            <div className={styles.title}><h2>Our Commitment :</h2></div>
            <p>At PU meetings, we are committed to providing exceptional user service. Our dedicated support team is ready to assist you with any questions or concerns you may have. We value your feedback and continuously strive to enhance our platform based on your input.</p>
          </div>
      </div>
      <div className={styles.lastline1}>
        <p>Thank you for choosing PU Meetings for your scheduling needs. We look forward to being a trusted</p>
        <br></br>
        <p>partner in your journey towards efficient and effective scheduling.</p>
      </div>
    </main>
  );
}
