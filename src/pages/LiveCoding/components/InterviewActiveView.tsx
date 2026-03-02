import { useEffect, useRef, useState } from "react";
import { MicIcon } from "@/src/components/shared";
import { ClockIcon } from "@/src/components/shared/icons/ClockIcon";
import { Button } from "../../../components/ui";
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
    <div
      className="flex flex-col h-full bg-white
  dark:bg-neutral-950"
    >
      <InterviewActiveViewHeader
        timeRemaining={timeRemaining}
        isAILoading={isAILoading}
        handleEnd={onEnd}
      />

      <MessageList
        messages={messages}
        isAILoading={isAILoading}
        finalTranscript={finalTranscript}
        interimTranscript={interimTranscript}
        messagesEndRef={messagesEndRef}
      />

      <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3">
        <VoiceInteractionField
          isAILoading={isAILoading}
          isListening={isListening}
          isSpeaking={isSpeaking}
          volume={volume}
          toggleListening={toggleListening}
          transcripts={{
            finalTranscript,
            interimTranscript,
          }}
        />

        <MessageInput
          isAILoading={isAILoading}
          isListening={isListening}
          onSendMessage={onSendMessage}
        />
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
    <div className={cn("flex items-start", !isInterviewer && "justify-end")}>
      <div
        className={cn(
          "rounded-lg px-3 py-2 max-w-[85%]",
          isInterviewer
            ? "bg-gray-100 dark:bg-gray-800"
            : "bg-neutral-800 dark:bg-neutral-100",
        )}
      >
        <p
          className={cn(
            "text-sm",
            isInterviewer
              ? "text-gray-900 dark:text-white"
              : "text-white dark:text-neutral-900",
          )}
        >
          {message.content}
        </p>
      </div>
    </div>
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
    <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex gap-2 items-center">
          <ClockIcon className="w-4 h-4" />
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
        </div>
      </div>
      <EndSessionButton onEnd={handleEnd} />
    </header>
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
      <Button variant="secondary" size="sm" onClick={() => setOpen(!open)}>
        종료
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-white dark:bg-neutral-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 w-48">
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            세션을 종료할까요?
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              취소
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => {
                setOpen(false);
                onEnd();
              }}
            >
              종료
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function AiThinkingBubble() {
  return (
    <div className="flex items-start">
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-3 py-2">
        <LoadingDots />
      </div>
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
    <div className="flex-1 overflow-auto p-4 space-y-3">
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

function TranscriptBubble({
  finalTranscript,
  interimTranscript,
}: TranscriptBubbleProps) {
  return (
    <div className="flex items-start justify-end">
      <div className="bg-neutral-200 dark:bg-neutral-800 rounded-lg px-3 py-2 max-w-[85%]">
        <p className="text-sm text-neutral-700 dark:text-neutral-300">
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
        </p>
      </div>
    </div>
  );
}

interface MessageInputProps {
  isAILoading: boolean;
  isListening: boolean;
  onSendMessage: (message: string) => void;
}

function MessageInput({
  isAILoading,
  isListening,
  onSendMessage,
}: MessageInputProps) {
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    onSendMessage(message);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      className="flex items-end gap-2"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          adjustHeight();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
          }
        }}
        placeholder="텍스트를 입력해주세요"
        disabled={isAILoading || isListening}
        rows={1}
        className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-neutral-900 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-neutral-100 disabled:opacity-50"
        aria-label="메시지 입력"
      />
      <Button
        type="submit"
        disabled={!input.trim() || isAILoading || isListening}
      >
        전송
      </Button>
    </form>
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
  transcripts,
}: VoiceInteractionFieldProps) {
  return (
    <div className="flex items-center justify-center gap-3 mb-3">
      <VoiceToggleButton
        isListening={isListening}
        disabled={isSpeaking || isAILoading}
        volume={volume}
        onClick={toggleListening}
      />

      <div className="flex-1">
        <StatusMessageDisplay
          isListening={isListening}
          isSpeaking={isSpeaking}
          isAILoading={isAILoading}
          transcripts={transcripts}
        />
      </div>
    </div>
  );
}

interface VoiceToggleButtonProps {
  onClick: () => void;
  isListening: boolean;
  volume: number;
  disabled: boolean;
}

function VoiceToggleButton({
  onClick,
  isListening,
  volume,
  disabled,
}: VoiceToggleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isListening ? "음성 인식 중지" : "음성 인식 시작"}
      aria-pressed={isListening}
      className={cn(
        "relative w-14 h-14 rounded-full flex items-center justify-center transition-all",
        isListening
          ? "bg-red-500 text-white"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      {isListening ? (
        <VoiceVisualizer volume={volume} />
      ) : (
        <MicIcon className="w-6 h-6" />
      )}
    </button>
  );
}

interface StatusMessageDisplayProps {
  isSpeaking: boolean;
  isAILoading: boolean;
  isListening: boolean;
  transcripts: {
    finalTranscript: string | null;
    interimTranscript: string | null;
  };
}

function StatusMessageDisplay({
  isListening,
  isSpeaking,
  isAILoading,
}: StatusMessageDisplayProps) {
  return (
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
  );
}
