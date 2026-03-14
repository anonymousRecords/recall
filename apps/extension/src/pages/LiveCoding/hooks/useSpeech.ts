import { useCallback, useEffect, useRef, useState } from "react";
import { usePreservedCallback } from "react-simplikit";
import { createSpeechToText, createTextToSpeech } from "../../../lib/speech";

interface UseSpeechProps {
	onTranscriptSubmit: (text: string) => void;
	onInterviewerSpeakingEnd: () => void;
}

export function useSpeech({
	onTranscriptSubmit,
	onInterviewerSpeakingEnd,
}: UseSpeechProps) {
	const [isMicOn, setIsMicOn] = useState(false);
	const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false);

	const [liveTranscript, setLiveTranscript] = useState("");
	const [finalTranscript, setFinalTranscript] = useState("");

	const speechToTextRef = useRef<ReturnType<typeof createSpeechToText>>(null);
	const textToSpeechRef = useRef<ReturnType<typeof createTextToSpeech>>(null);

	const preservedOnTranscriptSubmit = usePreservedCallback(onTranscriptSubmit);
	const preservedOnInterviewerSpeakingEnd = usePreservedCallback(
		onInterviewerSpeakingEnd,
	);

	useEffect(() => {
		speechToTextRef.current = createSpeechToText({
			onResult: (transcript, isTranscriptConfirmed) => {
				if (isTranscriptConfirmed) {
					setFinalTranscript(transcript);

					setLiveTranscript("");

					if (transcript.trim()) {
						preservedOnTranscriptSubmit(transcript.trim());
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

		textToSpeechRef.current = createTextToSpeech({
			onStart: () => setIsInterviewerSpeaking(true),
			onEnd: () => {
				setIsInterviewerSpeaking(false);
				preservedOnInterviewerSpeakingEnd();
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
	}, [preservedOnTranscriptSubmit, preservedOnInterviewerSpeakingEnd]);

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

	const stopSpeaking = () => {
		if (!textToSpeechRef.current) {
			return;
		}

		textToSpeechRef.current.stop();
		setIsInterviewerSpeaking(false);
	};

	const clearTranscript = () => {
		setLiveTranscript("");
		setFinalTranscript("");
	};

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
