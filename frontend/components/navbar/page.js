"use client";
import styles from "./navbar.module.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { usePathname } from 'next/navigation'
import path from "path";
import Link from "next/link";

export default function navbar() {

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  const [click, setclick] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState(0);
  const pathname = usePathname()
  const router = useRouter();

  const { data: session } = useSession();

  useEffect(() => {
    const tokens = Cookies.get("token");
    const fetchData = async () => {
      if (tokens != null) {
        const user = { tokens };
        try {
          const response = await fetch(`${apiUrl}/profile`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
          });

          if (response.status != 200) {
            if(response.status==400){
              Cookies.remove("token")
              window.location.reload()
            }
          }

          const result = await response.json();
          if(!result.post.active){
            router.push('/waiting')
          }
          setName(result.post.name);
          setRole(result.post.position);
          setLevel(result.post.level)
        } catch (error) {
          alert(error);
        }
      }
      else{
        router.push("/login")
      }
    };
    fetchData();
  }, []);

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

  return (
    <main className={styles.main}>

      {/* slide bar  */}
      <div className={styles.back_container}
        style={
          click
            ? { left: 0, opacity: 1 }
            : { left: "-100vw", opacity: 0, transitionDelay: "0.5s" }
        }
      >
        <div className={styles.sidebar} style={click ? { left: 0 } : { left: "-100vw" }}>
          <Image
            id={styles.cross}
            width={100}
            height={100}
            src="/cross.png"
            alt="close"
            onClick={() => {
              setclick(false);
            }}
            loading="lazy"
          />
          <div className={styles.main_profile}>
            <div className={styles.profile_img}>
              {session ? (
                <>
                  <Image
                    width={100}
                    height={100}
                    src={session.user.image}
                    alt="profile logo"
                    style={{ borderRadius: "50%" }}
                    loading="lazy"
                  />
                </>
              ) : (
                <Image
                  width={100}
                  height={100}
                  src="/profile_image.png"
                  alt="profile logo"
                  style={{ borderRadius: "50%" }}
                  loading="lazy"
                />
              )}
            </div>
            <div className={styles.name}>
              <p className={styles.post}>{role}</p>
              <p>{name}</p>
            </div>
          </div>
          <div className={styles.items}>
            <div className={styles.items_img}>
              <Image
                width={100}
                height={100}
                src="/Home-simple-door.png"
                alt="Home"
                loading="lazy"
              />
            </div>
            <div className={styles.item_list}>
              <Link href={"/"}>Home</Link>
            </div>
          </div>
          <div className={styles.items}>
            <div className={styles.items_img}>
              <Image
                width={100}
                height={100}
                src="/Calendar.png"
                alt="Calender"
                loading="lazy"
              />
            </div>
            <div className={styles.item_list}>
              <Link href={"/calendar"}>Calender</Link>
            </div>
          </div>
          <div className={styles.items}>
            <div className={styles.items_img}>
              <Image
                width={100}
                height={100}
                src="/My_meeting.png"
                alt="Calender"
                loading="lazy"
              />
            </div>
            <div className={styles.item_list}>
              <Link href={"/mymeeting"}>My Appointments</Link>
            </div>
          </div>
        
          <div className={styles.items}>
            <div className={styles.items_img}>
              <Image
                width={100}
                height={100}
                src="/add_booking.png"
                alt="booking"
                loading="lazy"
              />
            </div>
            <div className={styles.item_list}>
              <Link href={"/newappointment"}>Request Appointment</Link>
            </div>
          </div>
          <div className={styles.items}>
            <div className={styles.items_img}>
              <Image width={100} height={100} src="/Union.png" alt="Calender" loading="lazy"/>
            </div>
            <div className={styles.item_list}>
              <Link href={"/profile"}>Profile</Link>
            </div>
          </div>
          <div className={styles.items}>
            <div className={styles.items_img}>
              <Image
                width={100}
                height={100}
                src="/profile_sidebar.png"
                alt="User"
                loading="lazy"
              />
            </div>
            <div className={styles.item_list}>
              <Link href={"/aboutus"}>About Us</Link>
            </div>
          </div>
          <div className={styles.logout_sec}>
            
            <div className={styles.logout}>
              <div className={styles.history_img}>
                <Image width={100} height={100} src="/Log-out.png" alt="User" loading="lazy"/>
              </div>
              <div className={styles.logout_list}>
                <a
                  onClick={() => {
                    Cookies.remove("token")
                    router.push('/login') 
                    signOut({ redirect: false })
                  }}
                >
                  LogOut
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Desktop  */}
      <div className={styles.full_navbar} style={pathname=="/"&&screenWidth<=600 ? {boxShadow:'none'} : {}}>
        <div className={styles.top_bar}>

        {/* Only for mobile given label */}
        <label htmlFor="check">
              <Image
                id={styles.menu}
                width={100}
                height={100}
                src="/menu-02.png"
                alt="Menu Logo"
                onClick={() => {
                  setclick(true);
                }}
                loading="lazy"
              />
            </label>

          <div className={styles.image_bar} onClick={()=>{router.push("/")}}>
            <Image
              width={1000}
              height={1000}
              src="/logo2.png"
              alt="Pu Logo"
              loading="eager"
            />
            </div>
            
              <ul className={styles.navitem}>
                <li className={pathname=="/" ? styles.active : ""}>
                  <Link href={"/"} >Home</Link>
                </li>
                {level==2 && <li className={pathname=="/admin_use" ? styles.active : ""}>
                  <Link href={"/admin_use"} >Admin</Link>
                </li>}
                <li className={pathname=="/calendar" ? styles.active : ""}>
                  <Link href={"/calendar"} >Calender</Link>
                </li>
                <li className={pathname=="/mymeeting" ? styles.active : ""}>
                  <Link href={"/mymeeting"} >My Appointments</Link>
                </li>
                <li className={pathname=="/aboutus" ? styles.active : ""}>
                  <Link href={"/aboutus"} >About Us</Link>
                </li>
              </ul>

            <div className={styles.editbar}>
              <Image
                width={100}
                height={100}
                src="/add_icon.svg"
                alt="edit"
                onClick={() => {
                  router.push("/newappointment");
                }}
                className={styles.add_icon}
                loading="lazy"
              />

              {/* <Image
                width={100}
                height={100}
                src="/notification 1.png"
                alt="edit"
                className={styles.notification_icon}
              /> */}

              {session ? (
                <>
                  <Image
                    width={100}
                    height={100}
                    src={session.user.image}
                    alt="profile logo"
                    style={{ borderRadius: "50%" }}
                    onClick={() => {
                      router.push("/profile");
                    }}
                    className={styles.profile_icon}
                     loading="lazy"
                  />
                </>
              ) : (
                <Image
                  width={100}
                  height={100}
                  src="/profile_image.png"
                  alt="profile logo"
                  style={{ borderRadius: "50%" }}
                  onClick={() => {
                    router.push("/profile");
                  }}
                  className={styles.profile_icon}
                  loading="lazy"
                />
              )}
          </div>
          
        </div>
      </div>
    </main>
  );
}
