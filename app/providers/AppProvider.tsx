/* eslint-disable @next/next/no-sync-scripts */
"use client";

import React, { useState, useEffect, useRef } from "react";
import StudentVue from "studentvue";
import { Flowbite, Toast } from "flowbite-react";
import Topbar from "../../components/TopBar";
import SideBar from "../../components/SideBar";
import MobileBar from "../../components/MobileBar";
import { Grades, parseGrades, findCurrentPeriod, getCache } from "../../utils/grades";
import { HiX } from "react-icons/hi";
import { AnimateSharedLayout, MotionConfig } from "framer-motion";
import Cookies from "js-cookie";
import useWindowSize from "../../hooks/useWindowSize";
import { Analytics } from "@vercel/analytics/react";
import allDistricts from "../../lib/districts";
import { springConfig, reducedMotionConfig } from "../../utils/motionConfig";
import { SchoolsListType } from "../../utils/grades";
import { grades as sample, studentInfo as info, document, schedule, attendance } from "../../utils/sample";
import Head from "next/head";

interface ToastEntry {
  title: string;
  type: "success" | "error" | "warning" | "info";
}

const noShowNav = ["/login", "/", "/privacy", "/letter", "/faq"];

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [districtURL, setDistrictURL] = useState<string | undefined>(undefined);
  const [client, setClient] = useState<Awaited<ReturnType<typeof StudentVue.login>>["client"] | undefined>(undefined);
  const [settingsModal, setSettingsModal] = useState<boolean>(false);
  const [studentInfo, setStudentInfo] = useState<any>(undefined);
  const [toasts, setToasts] = useState<ToastEntry[]>([]);
  const [cacheLoading, setCacheLoading] = useState(true);
  const [grades, setGrades] = useState<Grades[] | undefined>();
  const [mp, setMP] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [referal, setReferal] = useState(false);
  const [districts, setDistricts] = useState(allDistricts);
  const [timestamp, setTime] = useState(0);
  const [ad, setAd] = useState<false | any>(undefined);
  const { width } = useWindowSize();
  const [modalBg, setModalBg] = useState(false);
  const scrollPos = useRef(0);
  const [schoolsList, setSchoolsList] = useState<SchoolsListType[] | undefined>(undefined);
  const [schoolIndex, setSchoolIndex] = useState(0);
  const isMediumOrLarger = width >= 768;
  const apiUrl = "https://studentvuelib.up.railway.app";
  const adServer = "https://adverts.grademelon.org";

  function guestLogin() {
    setClient({
      //@ts-expect-error
      guest: true,
      loadedAttendance: attendance,
      loadedSchedule: schedule,
      loadedDocuments: [{ file: { date: new Date(), type: "Sample" }, comment: "Sample Document", get: () => [{ base64: document }] }],
    });
    setGrades(sample);
    setStudentInfo(info);
    setMP(0);
  }

  const login = async (username: string, password: string, save: boolean, url?: string, encrypted?: boolean) => {
    await setLoading(true);

    const encryptedPass = getCourseSettings(username, password, encrypted, url);

    await StudentVue.login(
      url || districtURL,
      {
        username: username,
        password: password,
        encrypted: encrypted || false,
      },
      apiUrl,
    )
      .then(async (res) => {
        const fetchedClient = res.client;
        let extraData: any = {};
        for (let resp of res.responses) {
          extraData = { ...extraData, ...resp[1] };
        }

        Cookies.set("token", extraData.token, { expires: 5 / (60 * 24) });
        setClient(fetchedClient);

        districts.forEach((district) => {
          if (district.parentVueUrl == districtURL) {
            Cookies.set("districtURL", JSON.stringify(district), { expires: 14 });
          }
        });
        if (save) {
          localStorage.setItem("remember", "true");
          Cookies.set("username", username, { expires: 7, secure: false, sameSite: "Lax" });
          let myTemp;
          if (!encrypted) {
            myTemp = await encryptedPass;
          } else {
            myTemp = password;
          }
          Cookies.set("password", myTemp, { expires: 7 });
        } else {
          localStorage.setItem("remember", "false");
          Cookies.remove("username");
          Cookies.remove("password");
          Cookies.remove("districtURL");
        }

        extraData.gradingScale.mode = fetchedClient.district == "https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx" ? "mcps" : undefined;
        res.responses[0][0].gradingScale = extraData.gradingScale;

        setGrades(getCache(res.responses.map((resp) => resp[0])));
        setMP(findCurrentPeriod(getCache(res.responses.map((resp) => resp[0]))));

        await setLoading(false);
        return true;
      })
      .catch((err) => {
        createError(err.message);
        setLoading(false);
      });

    return false;
  };

  async function getCourseSettings(username: string, password: string, encrypted?: boolean, url?: string) {
    if (!encrypted) {
      const result = await (
        await fetch(apiUrl + "/encryptPassword", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ password: password }),
        })
      ).json();
      password = result.encryptedPassword;
    }
    return password;
  }

  async function getAd() {
    let schoolName = "default/ALL";
    let grade = "default/ALL";
    if (typeof window !== "undefined") {
      const cache = localStorage.getItem("infoCache");
      if (cache) {
        const parsed = JSON.parse(cache);
        schoolName = parsed.info?.currentSchool || schoolName;
        grade = parsed.info?.grade || grade;
      }
    }

    const response = await fetch(adServer + "/serve?school=" + encodeURIComponent(schoolName) + "&" + "grade=" + encodeURIComponent(grade), {
      method: "GET",
    });
    return await response.json();
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("guest") == "true" && !client) {
      guestLogin();
    }
  }, [client]);

  useEffect(() => {
    if (ad == undefined) {
      getAd()
        .then((res) => {
          setAd(res.ad);
        })
        .catch(() => {});
    }
  }, [ad]);

  async function buildConcurrentCache(gu): Promise<SchoolsListType> {
    const initalFetch = await client.gradebook(null, gu);

    const remainder = await Promise.all(initalFetch[0].reportingPeriod.available.map((period) => (period.index == initalFetch[0].reportingPeriod.current.index ? initalFetch : client.gradebook(period.index, gu))));

    let extraData: any = {};
    for (let resp of remainder) {
      extraData = { ...extraData, ...resp[1] };
    }
    const gradingScale = extraData.gradingScale;
    remainder[0][0].gradingScale = gradingScale;
    const builtCache = getCache(remainder.map((remain) => remain[0]));
    const builtMp = findCurrentPeriod(builtCache);
    return { mp: builtMp, cache: builtCache, gu: gu };
  }

  useEffect(() => {
    if (studentInfo?.schools?.length > 0 && grades && !schoolsList) {
      const schoolsData = Promise.all(studentInfo.schools.map(async (school) => ({ ...(await buildConcurrentCache(school.GU)), name: school.name })));
      schoolsData.then((data) => setSchoolsList([{ name: studentInfo.currentSchool, cache: grades, mp: mp, gu: null }, ...data]));
    }
  }, [studentInfo, grades, schoolsList, mp]);

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url.includes("grades/") && !isMediumOrLarger) {
        scrollPos.current = window.scrollY;
      }
    };

    const handleRouteNavigate = (url: string) => {
      if (url.includes("grades") && !url.includes("grades/") && !isMediumOrLarger) {
        window.scrollTo(0, scrollPos.current);
      }
    };

    return () => {};
  }, [isMediumOrLarger]);

  useEffect(() => {
    if (client !== undefined && studentInfo == undefined) {
      client
        .ChildList()
        .then(([info]) => {
          setStudentInfo(info);
          localStorage.setItem("infoCache", JSON.stringify({ user: client.username, info: info, url: districtURL }));
        })
        .catch(() => {
          client
            .studentInfo()
            .then(([info]) => {
              setStudentInfo(info);
              localStorage.setItem("infoCache", JSON.stringify({ user: client.username, info: info }));
            })
            .catch(() => {});
        });
    }
  }, [client, districtURL, studentInfo]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const guest = (params.get("guest") == "true" && !client) || window.location.pathname.includes("guest");

    let refURL = "";
    async function doLogin() {
      await login(Cookies.get("username"), Cookies.get("password"), true, districtURL, true);
    }
    if (Cookies.get("districtURL") != undefined && districtURL == undefined) {
      let cookieDistrict = JSON.parse(Cookies.get("districtURL"));
      if (districts.findIndex((district) => district.parentVueUrl == cookieDistrict.parentVueUrl) == -1) {
        let temp = districts;
        temp.push(cookieDistrict);
        setDistricts(temp);
      }
      setDistrictURL(cookieDistrict.parentVueUrl);
      refURL = cookieDistrict.parentVueUrl;
    } else {
      if (districtURL == undefined) {
        setDistrictURL("https://md-mcps-psv.edupoint.com");
      }
    }
    if (client === undefined && Cookies.get("username") != undefined && Cookies.get("password") != undefined && districtURL !== undefined) {
      doLogin();
    } else {
      if (client === undefined && (!noShowNav.includes(window.location.pathname) || window.location.pathname == "/") && !refURL && !guest) {
        window.location.href = "/login";
      }
    }
  }, [client, districtURL, districts]);

  function createError(message: string) {
    const preSets = { upgraded: "API Token Expired, come back soon?", incorrect: "Username or Password is Incorrect", invalid: "Username or Password is Incorrect", "load failed": "Network Error", failed: "Network Error:Try Again Later", socket: "Network Error" };
    for (let key in preSets) {
      if (message.toLowerCase().includes(key)) {
        message = preSets[key];
        break;
      }
    }
    setToasts((toasts) => [...toasts, { title: message, type: "error" }]);
    setTimeout(() => {
      setToasts((toasts) => toasts.slice(1));
    }, 5000);
  }

  const logout = async () => {
    await Cookies.remove("password");
    localStorage.removeItem("mps");
    await (window.location.href = "/login");

    setSchoolsList(undefined);
    setSchoolIndex(0);
    setClient(undefined);
    setGrades(undefined);

    setStudentInfo(undefined);

    if (localStorage.getItem("remember") == "false") {
      Cookies.remove("username");
    }
  };

  return (
    <Flowbite>
      <Analytics />
      <Head>
        <title>Grade Melon</title>
        {ad && <link rel="preload" as="image" href={ad.image} />}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-3YWWBKH03T"></script>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3837623952720969" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}	
                gtag('js', new Date());
                gtag('config', 'G-3YWWBKH03T');
              `,
          }}
        />
      </Head>
      <div className="fixed p-5 z-60">
        {toasts.map(({ title, type }, i) => (
          <div className="mb-5 z-50" key={i}>
            <Toast>
              <div
                onClick={() =>
                  setToasts((prev) => {
                    prev.splice(i, 1);
                    return prev;
                  })
                }
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200"
              >
                <HiX className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">{title}</div>
              <Toast.Toggle />
            </Toast>
          </div>
        ))}
      </div>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <Topbar studentInfo={studentInfo} logout={logout} client={client} />
        <div>
          {!client && (
            <MotionConfig transition={springConfig}>
              <AnimateSharedLayout>{children}</AnimateSharedLayout>
            </MotionConfig>
          )}

          {client && isMediumOrLarger && (
            <div className="pb-16 md:pb-0">
              <div className="flex overflow-x-auto">
                <SideBar client={client} timestamp={timestamp} setTime={setTime} ad={ad} settingsModal={settingsModal} setSettingsModal={setSettingsModal} setModalBg={setModalBg} setAd={setAd} studentInfo={studentInfo} logout={logout} />
                <MotionConfig transition={springConfig}>
                  <AnimateSharedLayout>{children}</AnimateSharedLayout>
                </MotionConfig>
              </div>
            </div>
          )}
          {client && !isMediumOrLarger && (
            <div className="pb-16 md:pb-0">
              <div className="md:hidden">
                <MotionConfig transition={reducedMotionConfig}>
                  <AnimateSharedLayout>{children}</AnimateSharedLayout>
                </MotionConfig>
                <div className="px-4 fixed bottom-5 w-full">
                  <MobileBar client={client} />
                </div>
                {modalBg && <div style={{ opacity: 0.1 }} className="fixed inset-0 bg-gray-500 z-0"></div>}
              </div>
            </div>
          )}
        </div>
      </div>
    </Flowbite>
  );
}
