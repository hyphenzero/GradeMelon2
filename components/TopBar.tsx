import React, { useState, useEffect,useRef } from "react";
import Link from "next/link";
import { FiLogOut } from "react-icons/fi";
import { BsQuestionLg } from "react-icons/bs";
import { RiCloseCircleLine } from "react-icons/ri";
import Cookies from "js-cookie";
import dynamic from "next/dynamic";
import {useRouter} from "next/router";

interface TopBarProps {
	studentInfo: any;
	client: any;
	logout: () => void;
}

const DarkModeToggle = dynamic(() => import('../components/Toggle'), {
	ssr: false,
  });




export default function TopBar({ studentInfo, logout, client }: TopBarProps) {
	const [dropdown, setDropdown] = useState(false);
	const [advertisePWA, setAdvertisePWA] = useState(false);
	const [advertiseDiscord, setAdvertiseDiscord] = useState(false);
	const [advertiseBrowser,setAdvertiseBrowser]=useState(false);
	const [partner,setPartner]=useState(false);
	const [closed,setClosed]=useState(false);
	const router = useRouter();
	const elementRef=useRef(null)
	const animationRef = useRef(null);
	const opacityRef = useRef(200);

	useEffect(() => {
	const ua = window.navigator.userAgent || "";
	const isChromebook = /\bCrOS\b/i.test(ua);
		if (!window.matchMedia("(display-mode: standalone)").matches&&!isChromebook) {
			if (localStorage.getItem("advertisePWA") === null&&(Number(localStorage.getItem('pwaCount'))<10||localStorage.getItem('pwaCount')==null)) {
				setAdvertisePWA(true);
				if(localStorage.getItem('pwaCount')==null){localStorage.setItem('pwaCount','0')}
				else{
					localStorage.setItem('pwaCount',(Number(localStorage.getItem('pwaCount'))+1).toString())
				}
				//localStorage.setItem("advertisePWA", "true");
			}
			console.log("This is not running as standalone.");
		}
	}, []);

	useEffect(() => {
	const ua = window.navigator.userAgent || "";
	const isChromebook = /\bCrOS\b/i.test(ua);
		let m=localStorage.getItem("advertiseDiscord")
		let n=localStorage.getItem("disCount");
			if ((m=== null&&(Number(n)<10||n==null))&&!isChromebook) {
				setAdvertiseDiscord(true);
				if(n==null){localStorage.setItem('disCount','0')}
				else{
					localStorage.setItem('disCount',(Number(n)+1).toString())
				}
				//localStorage.setItem("advertisePWA", "true");
			}

	


			if (navigator.userAgent.includes('Instagram') === true) {
				setAdvertiseBrowser(true);
				
			}
		
	}, []);


	const fadeOut = () => {
try{
		if(opacityRef.current ==200){
			opacityRef.current=100;
			elementRef.current.style.opacity=1
		}

		if (opacityRef.current <= 0) {
		  cancelAnimationFrame(animationRef.current);
			setPartner(false)
		  return;
		}
	  
		// Decrease by 1 every frame (~16.7ms at 60fps)
		// To take 10 seconds, we need to decrease by 0.167 per frame
		// (100 / (10 * 60))
		opacityRef.current -= 0.167;
		
		if (elementRef.current) {
		  elementRef.current.style.opacity = opacityRef.current / 100;
		}
	  
		animationRef.current = requestAnimationFrame(fadeOut);
	  }catch(error){console.log(error)}};

	useEffect(()=>{
		/*
		if (Cookies.get("partner") == undefined&&["/faq","/"].includes(router.pathname)) {
			setPartner(true);
			opacityRef.current=200
			

			
		}
		else{setPartner(false)}


*/
	},[router])


	useEffect(()=>{
		if(partner)fadeOut();
	},[partner])




	const closeAdvertisePWA = () => {
		setAdvertisePWA(false);
		localStorage.setItem("advertisePWA", "false");
	};


	const closePartner = () => {
		setPartner(false);
		Cookies.set("partner","false",{expires:14})
	};

	const closeAdvertiseDiscord = () => {
		setAdvertiseDiscord(false);
		localStorage.setItem("advertiseDiscord", "false");
	};


	return (
		<div className="fixed top-0 w-full z-50">
			{/* Main nav - always visible */}
			<nav className="bg-white/95 px-3 py-3 sm:px-5 dark:bg-zinc-900/95 relative z-10">
				<div className="flex flex-wrap justify-between items-center">
					<Link href={client ? "/grades" : "/"} className="flex items-center">
						<img
							src="/assets/logo.png"
							className="mr-3 h-6 sm:h-9"
							alt="Grade Melon Logo"
						/>
						<span className="self-center whitespace-nowrap text-xl font-semibold text-zinc-900 dark:text-zinc-100">
							Grade Melon
						</span>
					</Link>
					<div className="flex items-center md:order-2 gap-2">
							<div>
								<DarkModeToggle />
							</div>
							{studentInfo && (
								<div
									tabIndex={100}
									onBlur={(e) => {
										const target = e.currentTarget;

										requestAnimationFrame(() => {
											if (!target.contains(document.activeElement)) {
												setDropdown(false);
											}
										});
									}}
								>
									<button
										type="button"
										className="flex mr-3 rounded-full bg-zinc-800 text-sm md:mr-0"
										onClick={() => setDropdown(!dropdown)}
									>
										<span className="sr-only">Open user menu</span>
										<img
											className="w-10 h-10 object-cover rounded-full"
											src={
												studentInfo?.photo
													? `data:image/png;base64,${studentInfo.photo}`
													: "/assets/default-avatar.svg"
											}
											alt="User Icon"
										/>
									</button>

									{dropdown && (
										<div className="absolute right-4 top-10 z-30 my-4 list-none rounded-xl bg-white text-base shadow-lg dark:bg-zinc-800">
											<div className="py-3 px-4">
												<span className="block truncate text-sm text-zinc-900 dark:text-zinc-100">
													{studentInfo?.student.name}
												</span>
												<span className="block truncate text-sm font-medium text-zinc-500 dark:text-zinc-400">
													{studentInfo?.currentSchool}
												</span>
											</div>
											<ul className="py-1" aria-labelledby="user-menu-button">
												<li>
													<Link
														href="/faq"
														onClick={() => setDropdown(false)}
														className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200"
													>
														<BsQuestionLg /> FAQ & Info
													</Link>
												</li>
											</ul>
											<ul className="py-1" aria-labelledby="user-menu-button">
												<li>
													<a
														onClick={() => {
															setDropdown(false);
															logout();
														}}
														className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200"
													>
														<FiLogOut /> Log out
													</a>
												</li>
											</ul>
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				</nav>

			<div className="absolute top-0 left-0 w-full z-40">
				{!advertiseBrowser && partner && (
					<div ref={elementRef} className={`w-full bg-zinc-900 px-4 py-3 text-white bg-opacity-90`}>
						<p className="text-center text-sm font-medium flex gap-2 justify-center items-center">
							<img src="/assets/partner.webp" alt="" />
							<Link
								onClick={closePartner}
								href="https://klinn.works/"
								className="underline decoration-2 pl-1"
							>
								Find internships, research programs, competitions and more with Klinn!
							</Link>
							{/*
							<button onClick={closePartner}>
								<RiCloseCircleLine className="inline-block" size="1.1rem" />
							</button>*/}
						</p>
					</div>
				)}

				{!advertiseBrowser && !partner && advertisePWA && client && (
					<div className="w-full bg-zinc-900 px-4 py-3 text-white bg-opacity-90">
						<p className="text-center text-sm font-medium flex gap-2 justify-center">
							<span>
								Want to use Grade Melon as an app?
								<Link
									onClick={() => setAdvertisePWA(false)}
									className="underline decoration-2 pl-1"
									href="/faq?refer=app"
								>
									Check out how!
								</Link>
							</span>
							<button onClick={closeAdvertisePWA}>
								<RiCloseCircleLine className="inline-block" size="1.1rem" />
							</button>
						</p>
					</div>
				)}

				{!advertiseBrowser && !advertisePWA && advertiseDiscord && client && (
					<div className="w-full bg-zinc-900 px-4 py-3 text-white bg-opacity-90">
						<p className="text-center text-sm font-medium flex gap-2 justify-center ">
							<span>
								Want to contribute?
								<Link
									onClick={() => setAdvertiseDiscord(false)}
									className="underline decoration-2 pl-1"
									href="https://discord.gg/nwRs8WcQGc"
								>
									Join the Discord!
								</Link>
							</span>
							<button onClick={closeAdvertiseDiscord}>
								<RiCloseCircleLine className="inline-block" size="1.1rem" />
							</button>
						</p>
					</div>
				)}

				{advertiseBrowser && !closed && (
					<div className="w-full bg-zinc-900 px-4 py-3 text-white bg-opacity-90 ">
						<p className="text-center text-sm font-medium flex gap-2 justify-center">
							<span>
								You&apos;re viewing in Instagram!
								<p className="underline decoration-2 pl-1">
									Try it in your browser!
								</p>
							</span>
							<button onClick={() => setClosed(true)}>
								<RiCloseCircleLine className="inline-block" size="1.1rem" />
							</button>
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
