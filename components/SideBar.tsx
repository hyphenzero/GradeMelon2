import React, { useState, useEffect } from "react";
import { Sidebar } from "flowbite-react";
import { useRouter } from "next/router";
import {
	AiOutlineOrderedList,
	AiOutlineCalendar,
	AiOutlineBook,
} from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { BsGear, BsTable } from "react-icons/bs";
import { TbLayoutGrid } from "react-icons/tb";
import { BsQuestionLg } from "react-icons/bs";
import Link from "next/link";
import CustomAd from "./customAd"

interface NavProps {
	studentInfo: any;
	logout: () => void;
	ad:any;
	setAd:(ad:any)=>void;
	setTime:(time:number)=>void;
	timestamp:number;
	settingsModal:boolean;
	setSettingsModal:(b:boolean)=>void
	setModalBg:(b:boolean)=>void
	client:any

}

export default function SideBar({ studentInfo, logout,	ad,
	setAd,
	setTime,
	timestamp,settingsModal,setSettingsModal,setModalBg,client
	 }: NavProps) {
	const router = useRouter();

	return (
		<div className="flex w-fit flex-col items-center">
		<div className="w-fit h-full py-10 pl-10 sticky top-16 hidden md:block max-w-min">
			<aside className="w-64" aria-label="Sidebar">
				<div className="overflow-y-auto py-4 px-3 bg-white rounded-lg dark:bg-gray-800 shadow-md border border-gray-200 dark:border-gray-700">
					<ul className="space-y-2">
						<li>
							<Link
								href="/schedule"
								className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<AiOutlineOrderedList className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="ml-3">Schedule</span>
							</Link>
						</li>
						<li>
							<Link
								href={client.guest ? "/guest" : "/grades"}
								className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<AiOutlineBook className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="flex-1 ml-3 whitespace-nowrap">Gradebook</span>
							</Link>
						</li>
						<li>
							<Link
								href="/attendance"
								className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<AiOutlineCalendar className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="flex-1 ml-3 whitespace-nowrap">
									Attendance
								</span>
							</Link>
						</li>
						<li>
							<Link
								href="/documents"
								className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<IoDocumentTextOutline className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="flex-1 ml-3 whitespace-nowrap">Documents</span>
							</Link>
						</li>
						<li>
							<Link
								href="/faq"
								className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<BsQuestionLg className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="flex-1 ml-3 whitespace-nowrap">
									FAQ & Info
								</span>
							</Link>
						</li>
						<li>
							<a
								onClick={logout}
								className="cursor-pointer flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
							>
								<FiLogOut className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
								<span className="flex-1 ml-3 whitespace-nowrap">Logout</span>
							</a>
						</li>
					</ul>
					{(router.pathname === "/grades" || router.pathname.includes("/grades") || router.pathname ==="/guest" || router.pathname.includes("/guest") ) && (
						<ul className="pt-4 mt-4 space-y-2 border-t border-gray-200 dark:border-gray-700">
							<li>
								<div
									onClick={()=>{setSettingsModal(true);setModalBg(true)}}
									className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
								>
									<BsGear className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
									<span className="flex-1 ml-3 whitespace-nowrap">Settings</span>
								</div>
							</li>
							{router.pathname==="/grades" && 
							<React.Fragment>
							<li>
								<Link
									href="?view=card"
									className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
								>
									<TbLayoutGrid className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
									<span className="ml-3">Card View</span>
								</Link>
							</li>

							<li>
								<Link
									href="?view=table"
									className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg transition duration-75 hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white group"
								>
									<BsTable className="shrink-0 w-6 h-6 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
									<span className="ml-3">Table View</span>
								</Link>
							</li>
							</React.Fragment>
	 						}
						</ul>
					)}
				</div>
			</aside>
			{router.pathname.includes("grades") &&
		<div className="mt-4 flex shrink max-w-70 hidden md:block"><CustomAd timestamp={timestamp} setTime={setTime} ad={ad} setAd={setAd}/></div>
	 }
		</div>
		</div>
	);
}
