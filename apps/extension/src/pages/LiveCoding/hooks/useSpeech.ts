import { useCallback, useEffect, useRef, useState } from "react";
import { SpeechToText, TextToSpeech } from "../../../lib/speech";

interface UseSpeechProps {
	onFinalTranscript: (text: string) => void;
	onInterviewerSpeakingEnd?: () => void;
}

export function useSpeech({
	onFinalTranscript,
	onInterviewerSpeakingEnd,
}: UseSpeechProps) {
	const [isMicOn, setIsMicOn] = useState(false);
	const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);

	const [liveTranscript, setLiveTranscript] = useState("");
	const [finalTranscript, setFinalTranscript] = useState("");

	const speechToTextRef = useRef<SpeechToText | null>(null);
	const textToSpeechRef = useRef<TextToSpeech | null>(null);

	const onFinalTranscriptRef = useRef(onFinalTranscript);
	const onInterviewerSpeakingEndRef = useRef(onInterviewerSpeakingEnd);

	useEffect(() => {
		onFinalTranscriptRef.current = onFinalTranscript;
	}, [onFinalTranscript]);

	useEffect(() => {
		onInterviewerSpeakingEndRef.current = onInterviewerSpeakingEnd;
	}, [onInterviewerSpeakingEnd]);

	useEffect(() => {
		speechToTextRef.current = new SpeechToText({
			onResult: (transcript, isTranscriptConfirmed) => {
				if (isTranscriptConfirmed) {
					setFinalTranscript(transcript);

					setLiveTranscript("");

					if (transcript.trim()) {
						onFinalTranscriptRef.current(transcript.trim());
					}
				} else {
					setLiveTranscript(transcript);
				}
			},
			onError: (err) => {
				setIsMicOn(false);
				console.error("[Recall] STT 오류:", err);
			},
		});

		textToSpeechRef.current = new TextToSpeech({
			onStart: () => setIsInterviewerSpeaking(true),
			onEnd: () => {
				setIsInterviewerSpeaking(false);
				onInterviewerSpeakingEndRef.current?.();
			},
			onError: (err) => {
				setIsInterviewerSpeaking(false);
				console.error("[Recall] TTS 오류:", err);
			},
		});

		return () => {
			speechToTextRef.current?.stop();
			textToSpeechRef.current?.stop();
		};
	}, []);

	// LISTENING
	const startListening = useCallback(() => {
		if (!speechToTextRef.current) {
			return;
		}

		setIsMicOn(true);
		speechToTextRef.current.start();
	}, []);

	const stopListening = useCallback(() => {
		if (!speechToTextRef.current) {
			return;
		}

		setIsMicOn(false);
		speechToTextRef.current.stop();
	}, []);

	const toggleListening = useCallback(async () => {
		if (isMicOn) {
			stopListening();
		} else {
			startListening();
		}
	}, [isMicOn, startListening, stopListening]);

	// SPEAKING
	const startSpeaking = useCallback(
		(text: string) => {
			if (!textToSpeechRef.current) {
				return;
			}

			stopListening();
			textToSpeechRef.current.speak(text);
		},
		[stopListening],
	);

	const stopSpeaking = useCallback(() => {
		if (!textToSpeechRef.current) {
			return;
		}

		textToSpeechRef.current.stop();
		setIsInterviewerSpeaking(false);
	}, []);

	const clearTranscript = useCallback(() => {
		setLiveTranscript("");
		setFinalTranscript("");
	}, []);

	return {
		// UI
		isMicOn,
		isInterviewerSpeaking,
		liveTranscript,
		finalTranscript,
		toggleListening,

		// MACHINE
		startSpeaking,
		stopSpeaking,
		stopListening,
		clearTranscript,
	};
}
