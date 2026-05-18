import React, { useState, useEffect } from "react";
import Modal from "../components/ui/Modal";
import { BiSearchAlt } from "react-icons/bi";
import Head from "next/head";
import StudentVue from "studentvue";
import Cookies from "js-cookie";
import Link from "next/link";

interface LoginProps {
districtURL: string;
setDistrictURL: any;
client: any;
login: (username: string, password: string, save: boolean) => any;
guestLogin: () => void;
setToasts: any;
loading: boolean;
createError: (message: string) => void;
setDistricts: any;
districts: {
address: string;
name: string;
parentVueUrl: string;
zipcode?: string;
}[];
}

export default function Login({
login,
client,
districtURL,
setDistrictURL,
setToasts,
loading,
createError,
setDistricts,
districts,
guestLogin,
}: LoginProps) {
const [username, setUsername] = useState("");
const [password, setPassword] = useState("");
const [checkbox, setCheckbox] = useState(false);
const [showModal, setShowModal] = useState(false);
const [zipCode, setZipCode] = useState("");
const [trouble, setTrouble] = useState(false);

const districtUnavailable = districts[
districts.findIndex((d) => d.parentVueUrl === districtURL)
]?.address?.includes(" GA ");

useEffect(() => {
if (districtUnavailable) {
createError("Grademelon is unavailable in Georgia");
}

if (districtURL != "https://md-mcps-psv.edupoint.com" && districtURL != undefined) {
console.log("kill me bro", districtURL);
// window.location.assign("https://old.grademelon.org");
}
}, [districtURL]);

const handleSubmit = async (e) => {
e.preventDefault();
if (username == "" && password == "") {
guestLogin();
return;
}

let success = await login(username, password, checkbox);
if (!success) {
setTrouble(true);
}
await setPassword("");
if (success) {
await setUsername("");
}
};

useEffect(() => {
if (localStorage.getItem("remember") === "true") {
setCheckbox(true);
}
if (Cookies.get("username") != undefined) {
setUsername(Cookies.get("username"));
}
}, []);

const findDistricts = async () => {
StudentVue.findDistricts(zipCode)
.then((res) => {
if (res.length === 0) {
createError("No districts found for that zip code");
return;
} else {
setDistricts(res);
setDistrictURL(res[0].parentVueUrl);
}
})
.catch((err) => {
console.log(err);
createError(err.message);
});
};

return (
<div>
<Head>
<title>Login</title>
</Head>
<Modal show={showModal} onClose={() => setShowModal(false)}>
<Modal.Header>Choose School District</Modal.Header>
<Modal.Body>
<div>
<div>
<label htmlFor="zipcode" className="mb-2 block text-sm font-medium text-zinc-800">
Zip Code
</label>
<div className="flex gap-2">
<input
type="text"
value={zipCode}
onChange={(e) => setZipCode(e.target.value)}
className="block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-zinc-500"
placeholder="20901"
required
/>
<button
onClick={findDistricts}
className="rounded-xl bg-zinc-900 px-3 py-2.5 text-white transition hover:bg-zinc-800"
>
<BiSearchAlt size="1.2rem" />
</button>
</div>
<div>
<label htmlFor="districts" className="my-2 block text-sm font-medium text-zinc-800">
School Districts
</label>
<select
id="districts"
value={districtURL}
onChange={(e) => {
setDistrictURL(e.target.value);
}}
className="block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-zinc-500"
>
{districts.map((district, i) => (
<option key={i} value={district.parentVueUrl}>
{district.name}
</option>
))}
</select>
</div>
</div>
</div>
</Modal.Body>
<Modal.Footer>
<button
onClick={() => setShowModal(false)}
className="rounded-xl bg-zinc-200 px-3 py-2 text-sm font-medium text-zinc-800 transition hover:bg-zinc-300"
>
Close
</button>
</Modal.Footer>
</Modal>
<div className="mx-auto flex max-w-md flex-col items-center px-6 py-10 md:pt-24">
<div className="w-full rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
<h1 className="mb-6 text-2xl font-semibold tracking-tight text-zinc-900">Sign in</h1>
<form className="space-y-5">
<div>
<label htmlFor="username" className="mb-2 block text-sm font-medium text-zinc-800">
Username
</label>
<input
type="text"
value={username}
disabled={districtUnavailable}
onChange={(e) => setUsername(e.target.value)}
className="block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
placeholder="123456"
required
/>
</div>
<div>
<label htmlFor="password" className="mb-2 block text-sm font-medium text-zinc-800">
Password
</label>
<input
type="password"
disabled={districtUnavailable}
value={password}
onChange={(e) => setPassword(e.target.value)}
placeholder="••••••••"
className="block w-full rounded-xl border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
required
/>
</div>

<div className="flex items-center justify-between">
<div className="flex items-start">
<div className="flex h-5 items-center">
<input
id="remember"
aria-describedby="remember"
type="checkbox"
checked={checkbox}
onChange={(e) => setCheckbox(e.target.checked)}
className="h-4 w-4 rounded border-zinc-300 bg-zinc-50 text-zinc-900 focus:ring-zinc-500"
required
/>
</div>

<div className="ml-3 text-sm">
<label htmlFor="remember" className="text-zinc-600">
Remember me
</label>
</div>
</div>
</div>
<button
disabled={loading}
type="button"
onClick={() => setShowModal(true)}
className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-5 py-2.5 text-sm font-medium text-zinc-800 transition hover:bg-zinc-200"
>
{
districts[
districts.findIndex((d) => d.parentVueUrl === districtURL)
]?.name
}
</button>
<button
onClick={handleSubmit}
disabled={loading || districtUnavailable}
type="submit"
className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-zinc-50 transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
>
{username == "" && password == "" ? "Sign in as Guest" : "Sign in"}
{loading && (
<span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-50" />
)}
</button>
{trouble && (
<div className="space-y-2">
<p className="text-center text-sm text-zinc-700">
Having trouble logging in? Make sure you can login{" "}
<a target="blank" href={districtURL} className="font-medium text-zinc-900 underline">
here
</a>
</p>

<p className="text-center text-sm text-zinc-700">
{"Still won't work? Try re-setting your password "}
<a
target="blank"
href={districtURL + "/PXP2_Password_Help.aspx"}
className="font-medium text-zinc-900 underline"
>
here
</a>
</p>
</div>
)}
</form>
</div>
<Link href="/guest" style={{ display: "none" }}>
Login As Guest
</Link>
</div>
</div>
);
}
