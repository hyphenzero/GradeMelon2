import React, { useState, useEffect, useRef } from "react";
import "../styles/globals.css";
import StudentVue, { Client } from "studentvue";
import { useRouter } from "next/router";
import { Flowbite, Toast, useTheme } from "flowbite-react";
import Topbar from "../components/TopBar";
import SideBar from "../components/SideBar";
import MobileBar from "../components/MobileBar";
import CustomAd from "../components/customAd";
import { Grades,parseGrades,findCurrentPeriod,getCache} from "../utils/grades";
import Head from "next/head";
import { HiX } from "react-icons/hi";
import { AnimateSharedLayout,MotionConfig } from "framer-motion";
import Cookies from "js-cookie";
import useWindowSize from '../hooks/useWindowSize';
import { Analytics } from "@vercel/analytics/react";
import allDistricts from "../lib/districts";
import { springConfig,reducedMotionConfig } from "../utils/motionConfig";
import { SchoolsListType } from "../utils/grades";
import {grades as sample,studentInfo as info,document,schedule,attendance} from "../utils/sample"

interface Toast {
	title: string;
	type: "success" | "error" | "warning" | "info";
}



const noShowNav = ["/login", "/", "/privacy", "/letter","/faq"];

function MyApp({ Component, pageProps }) {
	const router = useRouter();
	const [districtURL, setDistrictURL] = useState(
		undefined
	);
	const [client, setClient] = useState<Awaited<ReturnType<typeof StudentVue.login>>["client"]>(undefined);
	const [settingsModal,setSettingsModal]=useState<boolean>(false);
	const [studentInfo, setStudentInfo] = useState(undefined);
	const [toasts, setToasts] = useState<Toast[]>([]);
	const [cacheLoading,setCacheLoading]=useState(true)
	const [grades, setGrades] = useState<Grades[]>();
	const [mp, setMP] = useState<number>();
	const [loading, setLoading] = useState(false);
	const [referal,setReferal]=useState(false);
	const [districts, setDistricts] = useState(allDistricts);
	const [timestamp,setTime]=useState(0);
    const [ad,setAd]=useState<false | any>(undefined);
	const { width } = useWindowSize();
	const [modalBg,setModalBg] = useState(false)
	const scrollPos=useRef(0)
	const [schoolsList,setSchoolsList] = useState<SchoolsListType[]>(undefined)
	const [schoolIndex,setSchoolIndex]=useState(0)
	const isMediumOrLarger = width >= 768;



	const apiUrl="https://studentvuelib.up.railway.app"


	function guestLogin(){
		//@ts-expect-error
		setClient({guest:true,loadedAttendance:attendance,loadedSchedule:schedule,loadedDocuments:[{file:{date:new Date(),type:"Sample"},comment:"Sample Document",get:()=>{return [{base64:document}]	}}]})
		setGrades(sample)
		setStudentInfo(info)
		setMP(0);
		if(router.pathname=="/"||router.pathname=="/login"){router.push("/guest")}
	}



	const login = async (
		username: string,
		password: string,
		save: boolean,
		url?: string,
		encrypted?:boolean
	) => {
		await setLoading(true);

		const encryptedPass=getCourseSettings(username,password,encrypted,url);
/*
you'd do it it in parallel

wherever you do a setGrades()
you'd also do in tandem, a setGradesCache() so they continously match up
could add a flag to see if it's changed so that you know if you need to refetch it upon a refresh

could cause some eroneous re-renders.

but actually it could work.


may be neater to reFactor grades obj to BE gradesCache and then create a seperate index prop to control which
one is the "active" one rather than maintain a whole "active" version as its own prop which is what grades effectively becomes now

refactor would be annoying as hell though. okay I'll do seperate for now and refactor later prob.




Also:

the settings modal is inconsitent. finals settings update live, letterScale and rounding don't
also the weights don't automagically change respectively yet
also exams / general full functionality and saving doesn't exist as a practical matter yet


the animation is janky now that there can be instantaneous switching

it's annoying and unuintuitive that switching from one marking period to the next on the same class
has no regard for moving classes, though, that was also how the og worked

optimization modal not done yet


it would probably be a good idea to show the final grade also on the Home Screen grades cards/table 




*/


		await StudentVue.login(url || districtURL, {
			username: username,
			password: password,
			encrypted:encrypted ||false
		},apiUrl)
			.then(async (res) => {
				const fetchedClient=res.client;
				let extraData:any={}
				for(let resp of res.responses){
					extraData={...extraData,...resp[1]} //combines all the extraData objs. lets later ones override
				}

			
				Cookies.set("token",extraData.token,{expires:5/(60*24)})
				console.log("para me?")
				console.log(fetchedClient);
				setClient(fetchedClient);
				
				districts.forEach(district=>{
					if(district.parentVueUrl==districtURL){Cookies.set("districtURL",JSON.stringify(district),{expires:14})}
				});
				if (save) {
					localStorage.setItem("remember", "true");
					Cookies.set("username",username,{expires:7,secure:false,sameSite:"Lax"})
					let myTemp;
					if(!encrypted){
						myTemp=await encryptedPass;
					}
					else{myTemp=password}
				Cookies.set("password",myTemp,{expires:7})


				} else {
					localStorage.setItem("remember", "false");
					Cookies.remove("username");
					Cookies.remove("password");
					Cookies.remove("districtURL");
				}
				/*sigh. I could implement lazy loading here so that we do this inital fetch of no report period
				and display that and put up blockers for the finals elements that need the full gradesCache
				that get chagned asynchronossly via an additional useState hook call it loading2 or smthn

				but then there also needs to be handling for if the user immediately decides they want a different
				report period, cuz then it's most optimal to await the already fetching stuff. SO I guess I could
				make it a ref or memo or smthn so it only ever changes once cause after that intial load you're never
				gunna need to fetch all MP's at once again, the user can't ask for it in current design 
				*/


				//let g=parseGrades(gradebook[]) or smthn so its a list of them or whatever. 

				extraData.gradingScale.mode=fetchedClient.district=="https://md-mcps-psv.edupoint.com/Service/PXPCommunication.asmx" ? "mcps" : undefined
				res.responses[0][0].gradingScale=extraData.gradingScale;
				
				setGrades(getCache(res.responses.map(resp=>resp[0])));
				setMP(findCurrentPeriod(getCache(res.responses.map(resp=>resp[0]))));


				if(router.pathname=="/"||router.pathname=="/login"){router.push("/grades")}
				
				await setLoading(false);
				return true;
			})
			.catch((err) => {
				console.log(err);
				createError(err.message)
				setLoading(false);
			});

		return false;
	};

	const adServer="https://adverts.grademelon.org"



	async function getCourseSettings(username,password,encrypted,url){
				if(!encrypted){
						const result =await(await fetch(apiUrl + "/encryptPassword", {
							'method': 'POST',
							'headers': { 'Content-Type': 'application/json' },
							'body': JSON.stringify({ 'password': password })
						})).json()
						password=result.encryptedPassword

	}
	/*
				const settingsFetch=await (await fetch('https://studentvuelib-clean.up.railway.app/getSettings',{
					'method':'POST',
					'headers':{'Content-Type':'application/json'},
					'body':JSON.stringify({username:username,'password':password,url:url})
						

				})).json()


				if(settingsFetch.status){
					setCourseSettings(settingsFetch.settings)
				}
				else{
					setCourseSettings(false)
				}
*/
				return password
			}



	async function getAd(){
		if(localStorage.getItem("infoCache")!=undefined){
			var schoolName:string=JSON.parse(localStorage.getItem("infoCache")).info.currentSchool;
			var grade:string=JSON.parse(localStorage.getItem("infoCache")).info.grade;
		}
		else{
			var schoolName="default/ALL";
			var grade="default/ALL"
		}

        const response=await fetch(adServer+"/serve?school="+encodeURIComponent(schoolName)+"&"+"grade="+encodeURIComponent(grade),{
            method:"GET"
        });
        return await response.json()

    
}


	useEffect(()=>{
		const params = new URLSearchParams(window.location.search);
		if(params.get("guest")=="true"&&!client){
			guestLogin()
		}

	})


	useEffect(() => { //ad fetch
		
		if(ad==undefined){
			getAd().then(res=>{
				console.log("ads fetch")
				setAd(res.ad);
			}).catch(error=>console.log(error))
	
		}


 
	  }, []);
 


async function buildConcurrentCache(gu):Promise<SchoolsListType>{
	const initalFetch=await client.gradebook(null,gu)

	const remainder=await Promise.all(initalFetch[0].reportingPeriod.available.map(period=>{if(period.index==initalFetch[0].reportingPeriod.current.index){return initalFetch}else{return client.gradebook(period.index,gu)}}))
	
	let extraData:any={}
	for(let resp of remainder){
	extraData={...extraData,...resp[1]} //combines all the extraData objs. lets later ones override
	}
	const gradingScale=extraData.gradingScale;
	remainder[0][0].gradingScale=gradingScale
	const builtCache=getCache(remainder.map(remain=>remain[0]))
	const builtMp=findCurrentPeriod(builtCache)
	return {mp:builtMp,cache:builtCache,gu:gu}
}


useEffect(()=>{
	if(studentInfo?.schools?.length>0&&grades&&!schoolsList){
		const schoolsData=Promise.all(studentInfo.schools.map(async(school)=>({...await buildConcurrentCache(school.GU),name:school.name})))
		schoolsData.then(data=>setSchoolsList([{name:studentInfo.currentSchool,cache:grades,mp:mp,gu:null},...data]))
	}

},[studentInfo,grades,schoolsList])



  useEffect(() => {
	console.log("am I crazxy")
    const handleRouteChange = (url: string) => {
      if(url.includes("grades/")&&!isMediumOrLarger){
		scrollPos.current=window.scrollY;

	  }
    };

	const handleRouteNavigate = (url:string) => {
		if(url.includes("grades")&&!url.includes("grades/")&&!isMediumOrLarger){
			window.scrollTo(0,scrollPos.current)
		}
	}

    router.events.on("routeChangeStart", handleRouteChange);
	router.events.on("routeChangeComplete", handleRouteNavigate);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
      router.events.off("routeChangeComplete", handleRouteNavigate);
    };


  }, [router]);

 

	useEffect(()=>{ //Hook responsible for fetching studentInfo
		if(client!==undefined&&studentInfo==undefined){
			if(localStorage.getItem("infoCache")!=undefined){ //temporarily re-enabling infoCache
				const cache=JSON.parse(localStorage.getItem("infoCache"));
				if(cache.user==client.username){
					setStudentInfo(cache.info);

//log login
 

					return

		


				}
			}


//vercel test2
			client.ChildList().then(([info])=>{
				console.log("im so so so tired")
				setStudentInfo(info)
				localStorage.setItem("infoCache",JSON.stringify({user:client.username,info:info,url:districtURL}))


 
			}).catch(error=>{console.log(error,"fuck me sideways and backwards");client.studentInfo().then(([info])=>{
				setStudentInfo(info);
				localStorage.setItem("infoCache",JSON.stringify({user:client.username,info:info}))
 

			}).catch()
		
		})
		}
	},[client])

	useEffect(() => {
				const params = new URLSearchParams(window.location.search);
		const guest=params.get("guest")=="true"&&!client||router.pathname.includes("guest")

		var refURL: string="";
		async function doLogin(){
			await login(Cookies.get("username"),Cookies.get("password"),true,districtURL,true)}
		if(Cookies.get("districtURL")!=undefined&&districtURL==undefined){
			console.log("RELEASE ME")
			let cookieDistrict=JSON.parse(Cookies.get("districtURL"));
			console.log(cookieDistrict);
			if(districts.findIndex(district=>district.parentVueUrl==cookieDistrict.parentVueUrl)==-1){let temp=districts;temp.push(cookieDistrict);setDistricts(temp)}
			setDistrictURL(cookieDistrict.parentVueUrl);
			console.log(districtURL)
			refURL=cookieDistrict.parentVueUrl;

		}else{if(districtURL==undefined){setDistrictURL("https://md-mcps-psv.edupoint.com")}}
		if(client===undefined&&Cookies.get("username")!=undefined&&Cookies.get("password")!=undefined&&districtURL!==undefined){
			doLogin();
			
		}else{if(client===undefined&&(!noShowNav.includes(router.pathname)||router.pathname=="/")&&!refURL&&!guest){console.log("SHIT FUCK");router.push("/login")}}
	}, [client,districtURL]);

	function createError(message:string){
		console.log("Verbose Error: ",message)
		console.log("Verbose Error: ",message)
		const preSets={"upgraded":"API Token Expired, come back soon?","incorrect":"Username or Password is Incorrect","invalid":"Username or Password is Incorrect","load failed":"Network Error","failed to fetch":"Network Error:Try Again Later","socket":"Network Error"};
		for(let key in preSets){
			if(message.toLowerCase().includes(key)){var message=preSets[key];break}
		}
		setToasts((toasts) => [...toasts, { title: message, type: "error" }]);
			setTimeout(() => {
				setToasts((toasts) => toasts.slice(1));
			}, 5000);
	}

const logout = async () => {
	await Cookies.remove("password");
	localStorage.removeItem("mps")
	await router.push("/login");
	
	setSchoolsList(undefined)
	setSchoolIndex(0)
	setClient(undefined);
	setGrades(undefined);
	
	
	 setStudentInfo(undefined);
	
	if(localStorage.getItem("remember")=="false"){Cookies.remove("username")}
	//Cookies.remove("districtURL");

};

	// useEffect(() => {
	// 	let username = localStorage.getItem("username");
	// 	let password = localStorage.getItem("password");
	// 	let remember = localStorage.getItem("remember");
	// 	let storedDistrictURL = localStorage.getItem("districtURL");
	// 	storedDistrictURL && setDistrictURL(storedDistrictURL);
	// 	if (remember === "true" && username && password && storedDistrictURL) {
	// 		login(username, password, true, districtURL);
	// 	}
	// }, []);

	return (
		<Flowbite>
			<Analytics/>
			<Head>
				<title>Grade Melon</title>
	{ad	&& <link rel="preload" as="image" href={ad.image} />}	
         <script async src="https://www.googletagmanager.com/gtag/js?id=G-3YWWBKH03T"></script>
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3837623952720969"/>
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
						<AnimateSharedLayout>
							<Component
								{...pageProps}
								districtURL={districtURL}
								setDistrictURL={setDistrictURL}
								login={login}
								client={client}
								grades={grades}
								setGrades={setGrades}
								setToasts={setToasts}
								loading={loading}
								mp={mp}
								setMP={setMP}
								createError={createError}
								districts={districts}
								setDistricts={setDistricts}
								isMediumOrLarger={isMediumOrLarger}
								timestamp={timestamp}
								setTime={setTime}
								ad={ad}
								setAd={setAd}
								width={width}
								modalBg={modalBg}
								setModalBg={setModalBg}
						 		scrollPos={scrollPos}
								schoolsList={schoolsList}
								setSchoolsList={setSchoolsList}
								schoolIndex={schoolIndex}
								setSchoolIndex={setSchoolIndex}
								guestLogin={guestLogin}

							/>
						</AnimateSharedLayout>
					</MotionConfig>
					)}

					{client && isMediumOrLarger && (
						<div className="pb-16 md:pb-0">
							<div className="flex overflow-x-auto">
								<SideBar 						
										client={client}
										timestamp={timestamp}
										setTime={setTime}
										ad={ad}
										settingsModal={settingsModal}
										setSettingsModal={setSettingsModal}
										setModalBg={setModalBg}
										setAd={setAd} studentInfo={studentInfo} logout={logout}/>
								<MotionConfig transition={springConfig}>
								<AnimateSharedLayout>
									<Component
										{...pageProps}
										districtURL={districtURL}
										setDistrictURL={setDistrictURL}
										client={client}
										login={login}
										grades={grades}
										setGrades={setGrades}
										setToasts={setToasts}
										loading={loading}
										mp={mp}
										setMP={setMP}
										createError={createError}
										districts={districts}
										setDistricts={setDistricts}
										isMediumOrLarger={isMediumOrLarger}
										timestamp={timestamp}
										setTime={setTime}
										ad={ad}
										settingsModal={settingsModal}
										setSettingsModal={setSettingsModal}
										setAd={setAd}
										width={width}
										scrollPos={scrollPos}
										modalBg={modalBg}
										setModalBg={setModalBg}
										schoolsList={schoolsList}
										setSchoolsList={setSchoolsList}
										schoolIndex={schoolIndex}
										setSchoolIndex={setSchoolIndex}
							 			guestLogin={guestLogin}
									/>
								</AnimateSharedLayout>
								</MotionConfig>
							</div>
						</div>
					)}
					{client && !isMediumOrLarger && (
						<div className="pb-16 md:pb-0">
							<div className="md:hidden">
								<MotionConfig transition={reducedMotionConfig}>
								<AnimateSharedLayout>
									<Component
										{...pageProps}
										districtURL={districtURL}
										client={client}
										login={login}
										setClient={setClient}
										grades={grades}
										setGrades={setGrades}
										setToasts={setToasts}
										loading={loading}
										mp={mp}
										setMP={setMP}
										createError={createError}
										districts={districts}
										setDistricts={setDistricts}
										isMediumOrLarger={isMediumOrLarger}
										settingsModal={settingsModal}
										setSettingsModal={setSettingsModal}
										timestamp={timestamp}
										setTime={setTime}
										ad={ad}
										setAd={setAd}
										width={width}
										modalBg={modalBg}
										setModalBg={setModalBg}
										scrollPos={scrollPos}
										schoolsList={schoolsList}
										setSchoolsList={setSchoolsList}
										schoolIndex={schoolIndex}
										setSchoolIndex={setSchoolIndex}
										guestLogin={guestLogin}
									/>
								</AnimateSharedLayout>
								</MotionConfig>
								<div className="px-4 fixed bottom-5 w-full">
									<MobileBar client={client} />
								</div>
								{modalBg && <div style={{opacity:0.1}} className="fixed inset-0 bg-gray-500 z-0"></div>}
							</div>
						</div>
					)}
				</div>
			</div>
		</Flowbite>
	);
}

export default MyApp;
