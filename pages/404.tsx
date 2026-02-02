import React from "react";
import Router from "next/router";
import { useRouter } from "../utils/navigation";

export default function NotFound() {
	const router = useRouter();

	React.useEffect(() => {
		if (window) {
			console.log(window.location.pathname);
			router.push(window.location.pathname);
		}
	}, []);

	return (
		<div className="p-5 md:p-10">
			<h1 className="dark:text-white font-bold text-4xl">
				404: Found Not Found
			</h1>
		</div>
	);
}
