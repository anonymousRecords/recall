import { useCallback, useEffect, useState } from "react";
import { PageHeader, PageLayout } from "../../../components/layout";
import { Button, Card, CardContent } from "../../../components/ui";

interface MicPermissionGuardProps {
	children: React.ReactNode;
}

export function MicPermissionGuard({ children }: MicPermissionGuardProps) {
	const { micPermission, openMicPermissionPage } = useMicPermission();

	if (micPermission === "loading") return null;
	if (micPermission === "granted") return <>{children}</>;

	return (
		<PageLayout header={<PageHeader title="live" />}>
			<div className="flex-1 overflow-auto p-4">
				<div className="space-y-4">
					<Card>
						<CardContent className="py-4 flex flex-col gap-4">
							<p className="text-[13px] text-[#d4d4d4]">
								마이크 권한이 필요해요
							</p>
							<p className="font-mono text-[12px] text-[#858585]">
								{messages[micPermission]}
							</p>
							<Button onClick={openMicPermissionPage}>
								마이크 권한 허용하기
							</Button>
						</CardContent>
					</Card>
				</div>
			</div>
		</PageLayout>
	);
}

const messages = {
	denied: "마이크 권한이 거부되어 있어요. 아래 버튼을 눌러 다시 허용해주세요.",
	prompt: "AI 면접관과 대화하려면 마이크 접근을 허용해주세요.",
};

type MicPermissionState = PermissionState | "loading";

function useMicPermission() {
	const [micPermission, setMicPermission] =
		useState<MicPermissionState>("loading");

	useEffect(() => {
		navigator.permissions
			.query({ name: "microphone" as PermissionName })
			.then((status) => {
				setMicPermission(status.state);
				status.onchange = () => setMicPermission(status.state);
			});
	}, []);

	useEffect(() => {
		const recheck = async () => {
			const micStatus = await navigator.permissions.query({
				name: "microphone",
			});
			setMicPermission(micStatus.state);
		};

		window.addEventListener("focus", () => recheck());
		document.addEventListener("visibilitychange", () => {
			if (document.visibilityState === "visible") recheck();
		});

		return () => {
			window.removeEventListener("focus", () => recheck());
			document.removeEventListener("visibilitychange", () => {
				if (document.visibilityState === "visible") recheck();
			});
		};
	}, []);

	const openMicPermissionPage = useCallback(() => {
		window.open(browser.runtime.getURL("/permission.html"), "_blank");
	}, []);

	return { micPermission, openMicPermissionPage };
}
