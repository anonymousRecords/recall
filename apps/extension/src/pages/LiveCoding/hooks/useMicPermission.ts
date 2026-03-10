import { useCallback, useEffect, useState } from "react";

type MicPermissionState = PermissionState | "loading";

export function useMicPermission() {
	const [micPermission, setMicPermission] =
		useState<MicPermissionState>("loading");

	useEffect(() => {
		let permissionStatus: PermissionStatus;

		navigator.permissions
			.query({ name: "microphone" as PermissionName })
			.then((status) => {
				permissionStatus = status;
				setMicPermission(status.state);
				status.onchange = () => setMicPermission(status.state);
			});

		return () => {
			if (permissionStatus) permissionStatus.onchange = null;
		};
	}, []);

	useEffect(() => {
		const recheck = async () => {
			const status = await navigator.permissions.query({
				name: "microphone" as PermissionName,
			});
			setMicPermission(status.state);
		};

		const onFocus = () => recheck();
		const onVisible = () => {
			if (document.visibilityState === "visible") recheck();
		};

		window.addEventListener("focus", onFocus);
		document.addEventListener("visibilitychange", onVisible);

		return () => {
			window.removeEventListener("focus", onFocus);
			document.removeEventListener("visibilitychange", onVisible);
		};
	}, []);

	const openPermissionPage = useCallback(() => {
		window.open(browser.runtime.getURL("/permission.html"), "_blank");
	}, []);

	return { micPermission, openPermissionPage };
}
