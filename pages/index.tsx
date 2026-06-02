import Head from "next/head";
import React from "react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { HiOutlineMail } from "react-icons/hi";
import { BiEditAlt, BiCalendar, BiFile } from "react-icons/bi";
import { AiOutlineOrderedList } from "react-icons/ai";
import { FiMoon, FiTrendingUp } from "react-icons/fi";
import { motion } from "framer-motion";

interface HomeProps {
client: any;
}

export default function Home({ client }: HomeProps) {
const features = [
{
name: "Edit your Grades",
icon: <BiEditAlt size={22} />,
description:
"Edit your grades and see how it affects your overall class grade.",
},
{
name: "Grade Optimizer",
icon: <FiTrendingUp size={22} />,
description:
"See the possible ways that you could earn your desired grade in a class.",
},
{
name: "View your Schedule",
icon: <BiCalendar size={22} />,
description: "View your schedule for all the terms in a year.",
},
{
name: "Check your Attendance",
icon: <AiOutlineOrderedList size={22} />,
description:
"Check if you were tardy or absent and view totals per period in a bar graph.",
},
{
name: "View Documents",
icon: <BiFile size={22} />,
description:
"Look at and download transcripts, report cards, and other documents.",
},
{
name: "Dark Mode",
icon: <FiMoon size={22} />,
description:
"Dark mode is available for all pages. It can be toggled on the Top Bar.",
},
];

return (
<div className="mx-auto max-w-6xl px-6 py-10 md:px-10 md:py-14">
<Head>
<title>Grade Melon</title>
</Head>

<div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm md:p-12">
<div className="grid items-center gap-10 lg:grid-cols-12">
<div className="lg:col-span-7">
<motion.h1
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ duration: 0.5 }}
className="mb-4 text-5xl font-semibold tracking-tight text-zinc-950 md:text-6xl"
>
Grade Melon
</motion.h1>
<motion.p
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 0.1, duration: 0.5 }}
className="mb-4 text-2xl font-medium text-zinc-700 md:text-3xl"
>
Stay in control of your grades.
</motion.p>
<motion.p
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 0.2, duration: 0.5 }}
className="mb-8 max-w-2xl text-base text-zinc-600 md:text-lg"
>
Grade Melon is an all new third party alternative to help you stay in
control of your grades. It allows any student using StudentVue to login
to check their schedule and calculate their grades.
</motion.p>

<motion.div
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 0.3, duration: 0.5 }}
className="flex flex-wrap gap-3"
>
<Link href="/login">
<button className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800">
Get Started
</button>
</Link>
<a
href="https://github.com/Themightypotato/GradeMelon2/"
target="blank"
>
<button className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
<div className="flex items-center gap-2">
<FaGithub size={"1rem"} /> Source
</div>
</button>
</a>
</motion.div>
</div>
<div className="hidden lg:col-span-5 lg:block">
<motion.img
initial={{ y: 50, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ delay: 0.3, duration: 0.5 }}
className="h-96 w-full rounded-2xl border border-zinc-200 bg-zinc-100 p-8"
src="/assets/herolight.svg"
alt="mockup"
/>
</div>
</div>
</div>

<div className="py-12">
<motion.h2
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 0.4, duration: 0.5 }}
className="mb-8 text-3xl font-semibold tracking-tight text-zinc-900 md:text-4xl"
>
Features
</motion.h2>
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
{features.map(({ name, icon, description }, i) => (
<motion.div
initial={{ y: 50, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{
delay: 0.5 + i * 0.1,
duration: 0.5,
}}
key={i}
className="rounded-2xl border border-zinc-200 bg-white p-5"
>
<div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
{icon}
</div>
<h3 className="mb-2 text-lg font-semibold text-zinc-900">{name}</h3>
<p className="text-sm text-zinc-600">{description}</p>
</motion.div>
))}
</div>
</div>

<div className="grid gap-4 md:grid-cols-2">
<div className="mt-4 md:mt-0 rounded-2xl border border-zinc-200 bg-white p-6">
<motion.h2
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.1, duration: 0.5 }}
className="mb-3 text-2xl font-semibold text-zinc-900"
>
Open Source
</motion.h2>
<motion.p
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.2, duration: 0.5 }}
className="mb-4 text-zinc-600"
>
Grade Melon is almost completely open source! You can find the source
code on our Github. We are commited to maintain transparency with our
users.
</motion.p>
<motion.div
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.3, duration: 0.5 }}
>
<a href="https://github.com/Themightypotato/GradeMelon2/" target="blank">
<button className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800">
<div className="flex gap-2 items-center">
<FaGithub size={"1.3rem"} /> Github Repository
</div>
</button>
</a>
</motion.div>
</div>
<motion.img
initial={{ y: 50, opacity: 0 }}
animate={{ y: 0, opacity: 1 }}
transition={{ delay: 0.2, duration: 0.5 }}
className="hidden h-80 w-full rounded-2xl border border-zinc-200 bg-zinc-100 p-8 md:block"
src="/assets/opensourcelight.svg"
alt="Open Source"
/>
</div>

<div className="mt-10 grid gap-6 md:grid-cols-2">
<div className="rounded-2xl border border-zinc-200 bg-white p-6">
<motion.h2
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.4, duration: 0.5 }}
className="text-2xl font-semibold text-zinc-900"
>
Advertising
</motion.h2>
<motion.p
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.5, duration: 0.5 }}
className="py-3 text-zinc-600"
>
Want to advertise on Grademelon? Visit <a>https://adverts.grademelon.org</a> to learn more
</motion.p>
<motion.div
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.6, duration: 0.5 }}
>
<Link href="https://adverts.grademelon.org/">
<button className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
Ads
</button>
</Link>
</motion.div>
</div>
<div className="rounded-2xl border border-zinc-200 bg-white p-6">
<motion.h2
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.4, duration: 0.5 }}
className="text-2xl font-semibold text-zinc-900"
>
FAQ
</motion.h2>
<motion.p
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.5, duration: 0.5 }}
className="py-3 text-zinc-600"
>
Have questions? Check out our FAQ page for answers to common questions.
</motion.p>
<motion.div
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.6, duration: 0.5 }}
>
<Link href="/faq">
<button className="rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50">
FAQ
</button>
</Link>
</motion.div>
</div>
</div>

<div className="mt-10 rounded-2xl border border-zinc-200 bg-white p-6">
<motion.h2
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.7, duration: 0.5 }}
className="text-2xl font-semibold text-zinc-900"
>
Contact
</motion.h2>
<motion.p
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.8, duration: 0.5 }}
className="pt-3 text-zinc-600"
>
If you have bug reports/suggestions, feel free to contact us by sending an
email!
</motion.p>
<Link href="mailto:support@grademelon.org">
<motion.p
initial={{ x: 0, opacity: 0 }}
animate={{ x: 0, opacity: 1 }}
transition={{ delay: 1.9, duration: 0.5 }}
className="py-3 font-semibold text-zinc-800 flex gap-2 items-center"
>
<HiOutlineMail size="1.3rem" /> support@grademelon.org
</motion.p>
</Link>
<Link href="/grades?guest=true" style={{ display: "none" }}>
Login As Guest
</Link>
</div>
</div>
);
}
