import React from "react";
import { AiOutlineOrderedList, AiOutlineCalendar, AiOutlineBook } from "react-icons/ai";
import { IoDocumentTextOutline } from "react-icons/io5";
import { useRouter } from "next/router";
import Link from "next/link";

export default function MobileBar({ client }: any) {
const router = useRouter();

const item = (active: boolean) =>
`flex w-full justify-center p-4 text-zinc-600 dark:text-zinc-300 ${
active ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100" : ""
}`;

return (
<div className="rounded-2xl bg-white/95 shadow-sm dark:bg-zinc-900/95">
<label htmlFor="tabs" className="sr-only">
Select Page
</label>
<ul className="flex w-full text-center text-sm font-medium">
<li className="w-full">
<Link href="/schedule" className={`${item(router.pathname === "/schedule")} rounded-l-2xl`} aria-current="page">
<AiOutlineOrderedList className="h-full" size="1.2rem" />
</Link>
</li>
<li className="w-full">
<Link href={client.guest ? "/guest" : "/grades"} className={item(router.pathname.includes("/grades") || router.pathname.includes("/guest"))}>
<AiOutlineBook className="h-full" size="1.2rem" />
</Link>
</li>
<li className="w-full">
<Link href="/attendance" className={item(router.pathname === "/attendance")}>
<AiOutlineCalendar className="h-full" size="1.2rem" />
</Link>
</li>
<li className="w-full">
<Link href="/documents" className={`${item(router.pathname === "/documents")} rounded-r-2xl`}>
<IoDocumentTextOutline className="h-full" size="1.2rem" />
</Link>
</li>
</ul>
</div>
);
}
