import React from "react";
import { useRouter } from "next/router";
import { AiOutlineOrderedList, AiOutlineCalendar, AiOutlineBook } from "react-icons/ai";
import { FiLogOut } from "react-icons/fi";
import { IoDocumentTextOutline } from "react-icons/io5";
import { BsGear, BsTable, BsQuestionLg } from "react-icons/bs";
import { TbLayoutGrid } from "react-icons/tb";
import Link from "next/link";
import CustomAd from "./customAd";

interface NavProps {
studentInfo: any;
logout: () => void;
ad: any;
setAd: (ad: any) => void;
setTime: (time: number) => void;
timestamp: number;
settingsModal: boolean;
setSettingsModal: (b: boolean) => void;
setModalBg: (b: boolean) => void;
client: any;
}

const itemBase =
"flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-200";

export default function SideBar({
logout,
ad,
setAd,
setTime,
timestamp,
setSettingsModal,
setModalBg,
client,
}: NavProps) {
const router = useRouter();
const inGrades =
router.pathname === "/grades" ||
router.pathname.includes("/grades") ||
router.pathname === "/guest" ||
router.pathname.includes("/guest");

const isActive = (matcher: boolean) =>
matcher ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : "";

return (
<div className="flex w-fit flex-col items-center">
<div className="sticky top-16 hidden h-full w-fit max-w-min py-8 pl-8 md:block">
<aside className="w-64" aria-label="Sidebar">
<div className="space-y-1 rounded-2xl bg-white/90 p-3 dark:bg-zinc-900/80">
<Link href="/schedule" className={`${itemBase} ${isActive(router.pathname === "/schedule")}`}>
<AiOutlineOrderedList className="h-5 w-5" />
<span>Schedule</span>
</Link>
<Link
href={client.guest ? "/guest" : "/grades"}
className={`${itemBase} ${isActive(router.pathname.includes("/grades") || router.pathname.includes("/guest"))}`}
>
<AiOutlineBook className="h-5 w-5" />
<span>Gradebook</span>
</Link>
<Link href="/attendance" className={`${itemBase} ${isActive(router.pathname === "/attendance")}`}>
<AiOutlineCalendar className="h-5 w-5" />
<span>Attendance</span>
</Link>
<Link href="/documents" className={`${itemBase} ${isActive(router.pathname === "/documents")}`}>
<IoDocumentTextOutline className="h-5 w-5" />
<span>Documents</span>
</Link>
<Link href="/faq" className={`${itemBase} ${isActive(router.pathname === "/faq")}`}>
<BsQuestionLg className="h-5 w-5" />
<span>FAQ & Info</span>
</Link>
<button onClick={logout} className={`${itemBase} w-full text-left`}>
<FiLogOut className="h-5 w-5" />
<span>Logout</span>
</button>

{inGrades && (
<div className="mt-3 space-y-1 pt-3">
<button
onClick={() => {
setSettingsModal(true);
setModalBg(true);
}}
className={`${itemBase} w-full text-left`}
>
<BsGear className="h-5 w-5" />
<span>Settings</span>
</button>
{router.pathname === "/grades" && (
<>
<Link href="?view=card" className={itemBase}>
<TbLayoutGrid className="h-5 w-5" />
<span>Card View</span>
</Link>
<Link href="?view=table" className={itemBase}>
<BsTable className="h-5 w-5" />
<span>Table View</span>
</Link>
</>
)}
</div>
)}
</div>
</aside>
{router.pathname.includes("grades") && (
<div className="mt-4 hidden max-w-70 shrink md:block">
<CustomAd timestamp={timestamp} setTime={setTime} ad={ad} setAd={setAd} />
</div>
)}
</div>
</div>
);
}
