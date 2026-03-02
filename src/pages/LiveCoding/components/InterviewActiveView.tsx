import { useEffect, useRef, useState } from "react";
import { PageLayout } from "../../../components/layout";
import { cn } from "../../../lib/utils";
import type { ChatMessage, SpeechState } from "../../../types";

interface InterviewActiveViewProps {
	messages: ChatMessage[];
	timeRemaining: number | null;
	isAILoading: boolean;
	speech: SpeechState;
	onSendMessage: (content: string) => Promise<void>;
	onEnd: () => Promise<void>;
}

export function InterviewActiveView({
	messages,
	timeRemaining,
	isAILoading,
	speech,
	onSendMessage,
	onEnd,
}: InterviewActiveViewProps) {
	const {
		isListening,
		isSpeaking,
		finalTranscript,
		interimTranscript,
		volume,
		toggleListening,
	} = speech;

	const messagesEndRef = useRef<HTMLDivElement>(null);
	const messagesLengthRef = useRef(messages.length);

	useEffect(() => {
		if (messages.length !== messagesLengthRef.current) {
			messagesLengthRef.current = messages.length;
			messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
		}
	}, [messages.length]);

	return (
		<PageLayout
			header={
				<InterviewActiveViewHeader
					timeRemaining={timeRemaining}
					isAILoading={isAILoading}
					handleEnd={onEnd}
				/>
			}
		>
			<MessageList
				messages={messages}
				isAILoading={isAILoading}
				finalTranscript={finalTranscript}
				interimTranscript={interimTranscript}
				messagesEndRef={messagesEndRef}
			/>

			<div className="shrink-0 border-t border-[#3e3e42] bg-[#252526] px-4 py-3 space-y-2">
				<VoiceInteractionField
					isAILoading={isAILoading}
					isListening={isListening}
					isSpeaking={isSpeaking}
					volume={volume}
					toggleListening={toggleListening}
					transcripts={{ finalTranscript, interimTranscript }}
				/>
				<MessageInput
					isAILoading={isAILoading}
					isListening={isListening}
					onSendMessage={onSendMessage}
				/>
			</div>
		</PageLayout>
	);
}

const formatTime = (seconds: number): string => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

interface InterviewActiveViewHeaderProps {
	timeRemaining: number | null;
	isAILoading: boolean;
	handleEnd: () => Promise<void>;
}

function InterviewActiveViewHeader({
	timeRemaining,
	handleEnd,
}: InterviewActiveViewHeaderProps) {
	return (
		<div className="flex items-center justify-between px-4 py-3">
			<div className="flex items-center gap-3">
				<p className="font-mono text-[11px] text-[#858585]">// live coding</p>
				{timeRemaining !== null && (
					<span
						className={cn(
							"font-mono text-[13px] font-medium",
							timeRemaining < 60
								? "text-[#f44747]"
								: timeRemaining < 300
									? "text-[#dcdcaa]"
									: "text-[#4ec9b0]",
						)}
					>
						{formatTime(timeRemaining)}
					</span>
				)}
			</div>
			<EndSessionButton onEnd={handleEnd} />
		</div>
	);
}

function EndSessionButton({ onEnd }: { onEnd: () => void }) {
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		const handleClickOutside = (e: MouseEvent) => {
			if (ref.current && !ref.current.contains(e.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [open]);

	return (
		<div ref={ref} className="relative">
			<button
				type="button"
				onClick={() => setOpen(!open)}
				className="font-mono text-[12px] text-[#858585] transition-colors hover:text-[#f44747] border border-[#3e3e42] px-2.5 py-1 hover:border-[#f44747]"
			>
				[ end ]
			</button>
			{open && (
				<div className="absolute right-0 top-full mt-1 z-10 border border-[#569cd6] bg-[#252526] p-3 w-44">
					<p className="font-mono text-[11px] text-[#858585] mb-3">
						&gt; 세션을 종료할까요?
					</p>
					<div className="flex gap-2">
						<button
							type="button"
							className="flex-1 border border-[#3e3e42] px-2 py-1 font-mono text-[11px] text-[#858585] hover:border-[#525252] hover:text-[#d4d4d4]"
							onClick={() => setOpen(false)}
						>
							[ 취소 ]
						</button>
						<button
							type="button"
							className="flex-1 border border-[#f44747] px-2 py-1 font-mono text-[11px] text-[#f44747] hover:bg-[#f44747]/10"
							onClick={() => {
								setOpen(false);
								onEnd();
							}}
						>
							[ 종료 ]
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

interface MessageBubbleProps {
	message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
	const isInterviewer = message.role === "interviewer";

	return (
		<div className="flex items-start gap-2">
			<span
				className={cn(
					"shrink-0 font-mono text-[11px] mt-0.5",
					isInterviewer ? "text-[#569cd6]" : "text-[#4ec9b0]",
				)}
			>
				{isInterviewer ? "[AI]" : "[YOU]"}
			</span>
			<p className="font-sans text-[13px] text-[#d4d4d4] leading-relaxed">
				{message.content}
			</p>
		</div>
	);
}

function AiThinkingBubble() {
	return (
		<div className="flex items-start gap-2">
			<span className="shrink-0 font-mono text-[11px] text-[#569cd6]">[AI]</span>
			<span className="font-mono text-[13px] text-[#858585]">···</span>
		</div>
	);
}

interface MessageListProps {
	messages: ChatMessage[];
	isAILoading: boolean;
	finalTranscript: string | null;
	interimTranscript: string | null;
	messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

function MessageList({
	messages,
	isAILoading,
	finalTranscript,
	interimTranscript,
	messagesEndRef,
}: MessageListProps) {
	return (
		<div className="flex-1 overflow-auto px-4 py-3 space-y-3">
			{messages.map((message) => (
				<MessageBubble key={message.id} message={message} />
			))}

			{isAILoading && <AiThinkingBubble />}

			{(finalTranscript || interimTranscript) && (
				<TranscriptBubble
					finalTranscript={finalTranscript}
					interimTranscript={interimTranscript}
				/>
			)}

			<div ref={messagesEndRef} />
		</div>
	);
}

interface TranscriptBubbleProps {
	finalTranscript: string | null;
	interimTranscript: string | null;
}

function TranscriptBubble({ finalTranscript, interimTranscript }: TranscriptBubbleProps) {
	return (
		<div className="flex items-start gap-2">
			<span className="shrink-0 font-mono text-[11px] text-[#4ec9b0] mt-0.5">[YOU]</span>
			<p className="font-sans text-[13px] leading-relaxed">
				<span className="text-[#858585]">{finalTranscript}</span>
				{interimTranscript && (
					<span className="text-[#525252] italic">
						{finalTranscript ? " " : ""}
						{interimTranscript}
					</span>
				)}
			</p>
		</div>
	);
}

interface MessageInputProps {
	isAILoading: boolean;
	isListening: boolean;
	onSendMessage: (message: string) => void;
}

function MessageInput({ isAILoading, isListening, onSendMessage }: MessageInputProps) {
	const [input, setInput] = useState("");
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const adjustHeight = () => {
		const el = textareaRef.current;
		if (!el) return;
		el.style.height = "auto";
		el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
	};

	const handleSubmit = () => {
		if (!input.trim() || isAILoading) return;
		const message = input.trim();
		setInput("");
		if (textareaRef.current) textareaRef.current.style.height = "auto";
		onSendMessage(message);
	};

	return (
		<form
			onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
			className="flex items-end gap-2 border border-[#3e3e42] bg-[#1e1e1e] focus-within:border-[#569cd6] transition-colors"
		>
			<span className="pl-3 pt-2 font-mono text-[12px] text-[#569cd6] self-start">&gt;</span>
			<textarea
				ref={textareaRef}
				value={input}
				onChange={(e) => { setInput(e.target.value); adjustHeight(); }}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						handleSubmit();
					}
				}}
				placeholder="텍스트를 입력하세요"
				disabled={isAILoading || isListening}
				rows={1}
				className="flex-1 resize-none bg-transparent px-2 py-2 font-mono text-[13px] text-[#d4d4d4] placeholder:text-[#858585] focus:outline-none disabled:opacity-40"
				aria-label="메시지 입력"
			/>
			<button
				type="submit"
				disabled={!input.trim() || isAILoading || isListening}
				className="self-end px-3 py-2 font-mono text-[12px] text-[#569cd6] disabled:opacity-30 hover:text-[#d4d4d4] transition-colors"
			>
				[ → ]
			</button>
		</form>
	);
}

const BAR_VARIATIONS = [
	{ id: "left", variation: 0.7 },
	{ id: "center", variation: 1 },
	{ id: "right", variation: 0.8 },
] as const;

function VoiceVisualizer({ volume }: { volume: number }) {
	const getBarHeight = (variation: number) => {
		if (volume < 0.01) return 2;
		return Math.max(2, Math.min(12, volume * 12 * variation));
	};

	return (
		<span className="inline-flex items-center gap-0.5" aria-hidden="true">
			{BAR_VARIATIONS.map((bar) => (
				<span
					key={bar.id}
					className="inline-block w-0.5 bg-[#f44747] transition-all duration-75"
					style={{ height: `${getBarHeight(bar.variation)}px` }}
				/>
			))}
		</span>
	);
}

interface VoiceInteractionFieldProps {
	isListening: boolean;
	isSpeaking: boolean;
	isAILoading: boolean;
	volume: number;
	toggleListening: () => void;
	transcripts: {
		finalTranscript: string | null;
		interimTranscript: string | null;
	};
}

function VoiceInteractionField({
	isListening,
	isSpeaking,
	isAILoading,
	volume,
	toggleListening,
}: VoiceInteractionFieldProps) {
	return (
		<div className="flex items-center gap-3">
			<button
				type="button"
				onClick={toggleListening}
				disabled={isSpeaking || isAILoading}
				aria-label={isListening ? "음성 인식 중지" : "음성 인식 시작"}
				aria-pressed={isListening}
				className={cn(
					"font-mono text-[12px] border px-2.5 py-1 transition-all disabled:opacity-40",
					isListening
						? "border-[#f44747] text-[#f44747]"
						: "border-[#3e3e42] text-[#858585] hover:border-[#525252] hover:text-[#d4d4d4]",
				)}
			>
				{isListening ? (
					<span className="flex items-center gap-1.5">
						<VoiceVisualizer volume={volume} />
						<span>[ ■ stop ]</span>
					</span>
				) : (
					"[ mic ]"
				)}
			</button>

			<span className="font-mono text-[12px]">
				{isListening ? (
					<span className="text-[#f44747]">● 듣는 중...</span>
				) : isSpeaking ? (
					<span className="text-[#569cd6]">AI 말하는 중...</span>
				) : isAILoading ? (
					<span className="text-[#858585]">AI 생각 중...</span>
				) : (
					<span className="text-[#525252]">// mic 버튼으로 말하기</span>
				)}
			</span>
		</div>
	);
}
