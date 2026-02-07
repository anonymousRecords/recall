import { useEffect, useRef, useState } from "react";
import { Button, Input } from "../../../components/ui";
import { cn } from "../../../lib/utils";
import type { ChatMessage } from "../../../types";

interface SessionActiveProps {
	messages: ChatMessage[];
	timeRemaining: number | null;
	isAILoading: boolean;
	isListening: boolean;
	isSpeaking: boolean;
	finalTranscript: string;
	interimTranscript: string;
	volume: number;
	hasPermission: boolean | null;
	onSendMessage: (content: string) => Promise<void>;
	onEnd: () => Promise<void>;
	onToggleListening: () => void;
	onRequestPermission: () => Promise<boolean>;
}

const formatTime = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

export function SessionActive({
	messages,
	timeRemaining,
	isAILoading,
	isListening,
	isSpeaking,
	finalTranscript,
	interimTranscript,
	volume,
	hasPermission,
	onSendMessage,
	onEnd,
	onToggleListening,
	onRequestPermission,
}: SessionActiveProps) {
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesLengthRef = useRef(messages.length);

	useEffect(() => {
		if (messages.length !== messagesLengthRef.current) {
			messagesLengthRef.current = messages.length;
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages.length]);

	const handleSubmit = (e: { preventDefault: () => void }) => {
		e.preventDefault();
		if (!input.trim() || isAILoading) return;

		const message = input.trim();
		setInput("");
		onSendMessage(message);
	};

	const handleEnd = () => {
		if (window.confirm("세션을 종료하시겠습니까?")) {
			onEnd();
		}
	};

	return (
		<div className="flex flex-col h-full">
			<header className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
				<div className="flex items-center gap-2">
					{timeRemaining !== null && (
						<span
							className={cn(
								"text-lg font-mono font-semibold",
								timeRemaining < 60
									? "text-red-600 dark:text-red-400"
									: timeRemaining < 300
										? "text-amber-600 dark:text-amber-400"
										: "text-gray-900 dark:text-white",
							)}
						>
							{formatTime(timeRemaining)}
						</span>
					)}
					{isAILoading && (
						<span className="text-xs text-gray-500 dark:text-gray-400">
							생각 중...
						</span>
					)}
				</div>
				<Button variant="secondary" size="sm" onClick={handleEnd}>
					종료
				</Button>
			</header>

			<div className="flex-1 overflow-auto p-4 space-y-3">
				{messages.map((message) => (
					<MessageBubble key={message.id} message={message} />
				))}

				{isAILoading && (
					<div className="flex items-start gap-2">
						<div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm">
							AI
						</div>
						<div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
							<LoadingDots />
						</div>
					</div>
				)}

				{(finalTranscript || interimTranscript) && (
					<div className="flex items-start gap-2 justify-end">
						<div className="bg-orange-100 dark:bg-orange-900/30 rounded-lg px-3 py-2 max-w-[80%]">
							<p className="text-sm">
								{finalTranscript && (
									<span className="text-orange-900 dark:text-orange-100">
										{finalTranscript}
									</span>
								)}
								{interimTranscript && (
									<span className="text-orange-600/70 dark:text-orange-300/70 italic">
										{finalTranscript ? " " : ""}
										{interimTranscript}
										<span className="animate-pulse">|</span>
									</span>
								)}
							</p>
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			<div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
				{hasPermission !== true ? (
					<div className="text-center py-2 mb-3">
						<button
							type="button"
							onClick={onRequestPermission}
							aria-label={
								hasPermission === false
									? "다시 권한 요청하기"
									: "마이크 권한 허용하기"
							}
							className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors mb-2"
						>
							<MicIcon className="w-5 h-5" />
							<span className="text-sm font-medium">
								{hasPermission === false
									? "다시 권한 요청하기"
									: "마이크 권한 허용하기"}
							</span>
						</button>
						<p className="text-xs text-gray-500 dark:text-gray-400">
							버튼 클릭 후 <strong>브라우저 주소창 아래</strong>에 나타나는
							<br />
							권한 요청 팝업에서 "허용"을 선택해주세요
						</p>
					</div>
				) : (
					<div className="flex items-center justify-center gap-3 mb-3">
						<button
							type="button"
							onClick={onToggleListening}
							disabled={isSpeaking || isAILoading}
							aria-label={isListening ? "음성 인식 중지" : "음성 인식 시작"}
							aria-pressed={isListening}
							className={cn(
								"relative w-14 h-14 rounded-full flex items-center justify-center transition-all",
								isListening
									? "bg-red-500 text-white"
									: "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
								(isSpeaking || isAILoading) && "opacity-50 cursor-not-allowed",
							)}
						>
							{isListening ? (
								<VoiceVisualizer volume={volume} />
							) : (
								<MicIcon className="w-6 h-6" />
							)}
						</button>

						<div className="flex-1">
							{isListening ? (
								<div>
									<p className="text-sm font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
										<span
											className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
											aria-hidden="true"
										/>
										듣는 중...
									</p>
									{(finalTranscript || interimTranscript) && (
										<p className="text-sm mt-1 truncate max-w-[200px]">
											<span className="text-gray-700 dark:text-gray-300">
												{finalTranscript}
											</span>
											{interimTranscript && (
												<span className="text-gray-500 dark:text-gray-500 italic">
													{finalTranscript ? " " : ""}
													{interimTranscript}
												</span>
											)}
										</p>
									)}
								</div>
							) : isSpeaking ? (
								<p className="text-sm text-blue-600 dark:text-blue-400">
									AI가 말하는 중...
								</p>
							) : isAILoading ? (
								<p className="text-sm text-gray-500 dark:text-gray-400">
									AI 생각 중...
								</p>
							) : (
								<p className="text-sm text-gray-500 dark:text-gray-400">
									마이크 버튼을 눌러 말하세요
								</p>
							)}
						</div>
					</div>
				)}

				<form onSubmit={handleSubmit} className="flex gap-2">
					<Input
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder="또는 텍스트로 입력..."
						disabled={isAILoading || isListening}
						className="flex-1"
						aria-label="메시지 입력"
					/>
					<Button
						type="submit"
						disabled={!input.trim() || isAILoading || isListening}
					>
						전송
					</Button>
				</form>
			</div>
		</div>
	);
}

interface MessageBubbleProps {
	message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
	const isInterviewer = message.role === "interviewer";

	return (
		<div
			className={cn("flex items-start gap-2", !isInterviewer && "justify-end")}
		>
			{isInterviewer && (
				<div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm shrink-0">
					AI
				</div>
			)}

			<div
				className={cn(
					"rounded-lg px-3 py-2 max-w-[80%]",
					isInterviewer
						? "bg-gray-100 dark:bg-gray-800"
						: "bg-orange-500 dark:bg-orange-600 text-white",
				)}
			>
				<p
					className={cn(
						"text-sm",
						isInterviewer ? "text-gray-900 dark:text-white" : "text-white",
					)}
				>
					{message.content}
				</p>
			</div>

			{!isInterviewer && (
				<div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-sm shrink-0">
					나
				</div>
			)}
		</div>
	);
}

function MicIcon({ className }: { className?: string }) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth={1.5}
			stroke="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
			/>
		</svg>
	);
}

function LoadingDots() {
	return (
		<output className="flex gap-1" aria-label="로딩 중">
			<span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
			<span
				className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"
				aria-hidden="true"
			/>
			<span
				className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"
				aria-hidden="true"
			/>
		</output>
	);
}

const BAR_VARIATIONS = [
	{ id: "left", variation: 0.7 },
	{ id: "center", variation: 1 },
	{ id: "right", variation: 0.8 },
] as const;

function VoiceVisualizer({ volume }: { volume: number }) {
	const getBarHeight = (variation: number) => {
		if (volume < 0.01) return 4;
		const baseHeight = volume * 24;
		return Math.max(4, Math.min(24, baseHeight * variation));
	};

	return (
		<div
			className="flex items-center justify-center gap-1 h-6"
			aria-hidden="true"
		>
			{BAR_VARIATIONS.map((bar) => (
				<div
					key={bar.id}
					className="w-1 rounded-full transition-all duration-75 bg-white"
					style={{ height: `${getBarHeight(bar.variation)}px` }}
				/>
			))}
		</div>
	);
}
