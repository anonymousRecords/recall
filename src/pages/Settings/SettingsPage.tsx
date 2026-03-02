import { Suspense, useEffect, useRef, useState } from "react";
import { PageHeader, PageLayout } from "../../components/layout";
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Select,
} from "../../components/ui";
import type { AIProvider } from "../../types";
import { useLiveCodingForm } from "./hooks/useLiveCodingForm";
import { useSettingsForm } from "./hooks/useSettingsForm";

const AI_PROVIDER_OPTIONS = [
	{ value: "openai", label: "OpenAI (GPT-4o-mini)" },
	{ value: "claude", label: "Claude (Haiku)" },
];

type SettingsMessage = {
	type: "success" | "error";
	text: string;
};

export function SettingsPage() {
	return (
		<Suspense fallback={null}>
			<SettingsPageContent />
		</Suspense>
	);
}

function SettingsPageContent() {
	const generalSettings = useSettingsForm();
	const liveCoding = useLiveCodingForm();

	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState<SettingsMessage | null>(null);
	const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

	useEffect(() => {
		if (message === null) {
			return;
		}

		clearTimeout(timerRef.current);
		timerRef.current = setTimeout(() => setMessage(null), 3000);

		return () => clearTimeout(timerRef.current);
	}, [message]);

	return (
		<PageLayout header={<PageHeader title="설정" />}>
			<div className="flex-1 overflow-auto p-4">
				<div className="space-y-4">
					<IntervalCard
						intervals={generalSettings.intervals}
						setIntervals={generalSettings.setIntervals}
					/>
					<LiveCodingCard
						aiProvider={liveCoding.aiProvider}
						setAiProvider={liveCoding.setAiProvider}
						apiKey={liveCoding.apiKey}
						setApiKey={liveCoding.setApiKey}
						testingApi={liveCoding.testingApi}
						apiTestResult={liveCoding.apiTestResult}
						onTestApi={liveCoding.handleTestApi}
					/>

					{message && (
						<div
							className={`border px-4 py-2 font-mono text-[12px] ${
								message.type === "success"
									? "border-[#4ec9b0] text-[#4ec9b0]"
									: "border-[#f44747] text-[#f44747]"
							}`}
						>
							{message.text}
						</div>
					)}

					<SettingsActions
						onReset={() => {
							generalSettings.reset();
							setMessage({ type: "success", text: "설정이 초기화되었습니다" });
						}}
						onSave={async () => {
							setMessage(null);

							const error = generalSettings.validate();
							if (error) {
								setMessage({ type: "error", text: error });
								return;
							}

							setSaving(true);
							try {
								await generalSettings.save();
								await liveCoding.save();
								setMessage({ type: "success", text: "설정이 저장되었습니다" });
							} finally {
								setSaving(false);
							}
						}}
						saving={saving}
					/>
				</div>

				<div className="mt-8 border-t border-[#3e3e42] pt-6">
					<AppInfoFooter />
				</div>
			</div>
		</PageLayout>
	);
}

interface IntervalCardProps {
	intervals: string;
	setIntervals: (intervals: string) => void;
}

function IntervalCard({ intervals, setIntervals }: IntervalCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>복습 주기</CardTitle>
				<CardDescription>
					에빙하우스 망각곡선 기반 복습 주기를 설정해요
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Input
					value={intervals}
					onChange={(e) => setIntervals(e.target.value)}
					placeholder="1, 3, 7, 14, 30"
					hint="쉼표로 구분하여 입력 (기본값: 1, 3, 7, 14, 30일)"
				/>
			</CardContent>
		</Card>
	);
}

interface LiveCodingCardProps {
	aiProvider: AIProvider;
	setAiProvider: (provider: AIProvider) => void;
	apiKey: string;
	setApiKey: (key: string) => void;
	testingApi: boolean;
	apiTestResult: string | null;
	onTestApi: () => void;
}

function LiveCodingCard({
	aiProvider,
	setAiProvider,
	apiKey,
	setApiKey,
	testingApi,
	apiTestResult,
	onTestApi,
}: LiveCodingCardProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>라이브 코딩</CardTitle>
				<CardDescription>AI 면접관 설정</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<Select
					label="AI 제공자"
					options={AI_PROVIDER_OPTIONS}
					value={aiProvider}
					onChange={(e) => setAiProvider(e.target.value as AIProvider)}
				/>

				<Input
					label="API 키"
					type="password"
					value={apiKey}
					onChange={(e) => setApiKey(e.target.value)}
					placeholder={aiProvider === "openai" ? "sk-..." : "sk-ant-..."}
					hint={
						aiProvider === "openai"
							? "OpenAI API 키 (platform.openai.com)"
							: "Anthropic API 키 (console.anthropic.com)"
					}
				/>

				<div className="flex items-center gap-3">
					<Button
						variant="secondary"
						size="sm"
						onClick={onTestApi}
						disabled={testingApi || !apiKey}
					>
						{testingApi ? "테스트 중" : "연결 테스트"}
					</Button>
					{apiTestResult && (
						<span
							className={`text-sm font-medium ${
								apiTestResult.includes("성공")
									? "text-emerald-600 dark:text-emerald-400"
									: "text-red-600 dark:text-red-400"
							}`}
						>
							{apiTestResult}
						</span>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

interface SettingsActionsProps {
	onReset: () => void;
	onSave: () => void;
	saving: boolean;
}

function SettingsActions({ onReset, onSave, saving }: SettingsActionsProps) {
	return (
		<div className="flex gap-3 pt-2">
			<Button
				type="button"
				variant="secondary"
				className="flex-1"
				onClick={onReset}
			>
				초기화
			</Button>
			<Button
				type="button"
				className="flex-1"
				onClick={onSave}
				disabled={saving}
			>
				{saving ? "저장 중" : "저장"}
			</Button>
		</div>
	);
}

function AppInfoFooter() {
	return (
		<div className="text-center font-mono">
			<p className="text-[11px] text-[#858585]">Recall v0.1.0</p>
			<p className="mt-0.5 text-[11px] text-[#525252]">
				Where memory becomes skill
			</p>
		</div>
	);
}
