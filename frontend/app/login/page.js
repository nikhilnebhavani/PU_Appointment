"use client";
import Image from "next/image";
import styles from "./login.module.css";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Login() {
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [institute, setInstitute] = useState("");
  const [department, setDepartment] = useState("");
  const [position, setPosition] = useState("");
  const session = useSession();
  const router = useRouter();
  const [data, setData] = useState();
  const [form, setForm] = useState(false);
  const institutes = [
    "Parul Institute Of Physiotherapy  ",
    "Parul Institute Of Management And Research -MBA",
    "Parul Institute Of Paramedical And Health Sciences ",
    "Parul Institute Paramedical Education And Research ",
    "College Of Agricuiture ",
    "Parul Institute Of Homoeopathy & Research ",
    "Parul Institute Of Technology ",
    "Parul Institute Of Business Administration ",
    "Institute Of Pharmaceutical Sciences",
    "Parul Polytechnic Institute ",
    "Parul Institute Of Nursing ",
    "Parul Institute Of Engineering & Technology ",
    "Parul Institute Of Engineering and Technology (DS)",
    "School Of Pharmacy ",
    "Parul Institute Of Pharmacy and Research ",
    "Parul Institute Of Computer Application (BCA)",
    "Parul Institute Of Commerce",
    "Parul Institute Of Social Work ",
    "Parul Institute Of Law ",
    "Parul Institute Of Hotel Management & Catering Technology ",
    "Parul Institute Of Arts ",
    "Parul Institute Of Archiecature & Research ",
    "Jawaharlal Nehru Homoeopathic Medical College ",
    "Parul Institute Of Pharmacy ",
    "Parul Institute Of Applied Sciences ",
    "Parul Institute Of  Ayurved ",
    "Parul Institute Of Ayurveda & Research ",
    "Parul Institute Of Design ",
    "Parul Institute Of Public Health ",
    "Parul College Of Pharmacy And Research Ahmedabad ",
    "Ahmedabad Homoeopathic Medical College ",
    "Rajkot Homoeopathic Medical College ",
    "Parul Institute Of Applied Sciences Ahmedabad ",
    "PIPT",
    "Ahmedabad Pysiotheraphy College ",
    "Parul Institute Of Physiotherapy And Research ",
    "Parul Institute Of Nursing And Research ",
    "PIMSR",
  ];
  const positions = [
    "Director",
    "Dean",
    "Principal",
    "Vice principal",
    "Academic director",
    "Professor",
    "Associate professor",
    "Assistant professor",
  ];

  useEffect(() => {
    const token = Cookies.get("token");
    setData(session.data);
    console.log(session.status);
    if (session.status === "authenticated" && token) {
      router.push("/");
    } else if (session.status === "authenticated") {
      login(session.data.user.email);
      setForm(true);
      setName(session.data.user.name)
      setEmail(session.data.user.email)
    }
  }, [session, data, form]);

  const login = async (email) => {
    const user = { email };
    try {
      const response = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if (response.status === 200) {
        const token = await response.json().then((data) => {
          return data.token;
        });

        Cookies.set("token", token);

        window.location.reload();
      } else {
        console.log("Not Found");

        Cookies.set("form", true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleRegister = async () => {
    if(department==""){setDepartment("-")}
    const user = { email, name, number, institute, department, position };
    try {
      const response = await fetch(`${apiUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });
      if (response.status === 201) {
        const res = await response.json();
        Cookies.set("token", res.token);
        const email_send = await fetch(`${apiUrl}/email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({email_type:"new_user", tokens: res.token}),
        });
        if(email_send.ok){
          alert("Welcome to PU Meeting")
          router.push("/", { scroll: false });
        }
        else{
          alert("no ok")
        }
        
      } else {
        const err = await response.json();
        alert("Error:" + err.error);
      }
    } catch (error) {
      alert(error);
    }
  };

  const size = useWindowSize();

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setNumber(value);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.flex}>
        {form && size.width < 980 ? (
          <></>
        ) : (
          <div className={styles.h_screen}>
            <Image
              src="/GatePic.png"
              width={1000}
              height={1000}
              alt="Picture of Gate"
            />
          </div>
        )}
        <div className={styles.signin_sec}>
          <div
            className={styles.signup}
            style={form ? {} : { display: "none" }}
          >
            <div className={styles.header}>
              <Image
                width={1000}
                height={1000}
                src={"/logo2.png"}
                alt="pulogo"
              />
              <div className={styles.signupinfo}>
                <h2>
                  <b>User Details</b>
                </h2>
                <p>Fill your Details</p>
              </div>
            </div>
            <div className={styles.enterinfo}>
              <div className={styles.namenum}>
                <Image
                  width={1000}
                  height={1000}
                  src="/profile.png"
                  alt="userlogo"
                />
                <input
                  type="text"
                  placeholder="Full Name"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  value={name}
                ></input>
              </div>
              <div className={styles.namenum}>
                <Image
                  width={1000}
                  height={1000}
                  src="/whatsapp.png"
                  alt="whatsapplogo"
                />
                <input
                  type="text"
                  placeholder="Whatsapp Number"
                  onChange={handleChange}
                  value={number}
                ></input>
              </div>
            </div>
            <div className={styles.dropdn}>
              <div className={styles.droplist}>
                <select
                  id="Institute"
                  onChange={(e) => {
                    setInstitute(e.target.value);
                  }}
                >
                  <option value="" selected disabled>
                    Select Institute
                  </option>
                  {institutes.map((e) => {
                    return <option value={e}>{e}</option>;
                  })}
                </select>
                <Image
                  width={100}
                  height={100}
                  src="/dropdownicon.png"
                  alt="dropdownicon"
                ></Image>
              </div>

              <div className={styles.droplist}>
                <select
                  id="Position"
                  onChange={(e) => {
                    setPosition(e.target.value);
                  }}
                >
                  <option value="" selected disabled>
                    Selcet Position
                  </option>
                  {positions.map((e)=>{
                    return(<option value={e}>{e}</option>)
                  })}

                  
                </select>
                <Image
                  width={100}
                  height={100}
                  src="/dropdownicon.png"
                  alt="dropdownicon"
                ></Image>
              </div>
            </div>
            <div className={styles.namenum}>
                <input
                  id="Department"
                  onChange={(e) => {
                    setDepartment(e.target.value);
                  }}
                  placeholder="DepartMent"
                />
                  
              </div>
            <div className={styles.btnnext}>
              <button
                onClick={() => {
                  if (name === "") {
                    alert("Enter Your Full Name");
                  } else if (number.length === 0) {
                    alert("Enter Your Whatsapp Number");
                  } else if (institute === "") {
                    alert("Select Your Institute");
                  } else if (number.length != 10) {
                    alert("Enter a Valid Whatsapp Number");
                  } else if (position === "") {
                    alert("Select Your Position");
                  } else {
                    handleRegister();
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
          <div
            className={styles.signintxt}
            style={form ? { display: "none" } : {}}
          >
            <Image width={200} height={200} src="/logo2.png" alt="pulogo" className={styles.logo} />
            <div>
            <h2>
              Welcome to P.U. Appointments
            </h2>
            <p>Where Schedules Align and Productivity Soars!.</p>  
            </div>
            <div
              className={styles.signin_btn}
              onClick={() => {
                signIn();
              }}
            >
              <Image
                width={100}
                height={100}
                src="/plus.png"
                alt="googlelogo"
              />
              <p>Sign in with Google</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return windowSize;
}
