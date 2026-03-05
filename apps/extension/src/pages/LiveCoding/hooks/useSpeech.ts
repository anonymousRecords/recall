import { useCallback, useEffect, useRef, useState } from "react";
import { SpeechRecognizer, SpeechSynthesizer } from "../../../lib/speech";
import type { VoiceInputMode } from "../../../types";

function useAudioVolume(isListening: boolean, hasPermission: boolean | null) {
	const [volume, setVolume] = useState(0);
	const audioContextRef = useRef<AudioContext | null>(null);
	const analyserRef = useRef<AnalyserNode | null>(null);
	const streamRef = useRef<MediaStream | null>(null);
	const animationFrameRef = useRef<number | null>(null);

	useEffect(() => {
		if (!isListening || hasPermission !== true) {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
			if (streamRef.current) {
				for (const track of streamRef.current.getTracks()) track.stop();
				streamRef.current = null;
			}
			if (audioContextRef.current) {
				audioContextRef.current.close();
				audioContextRef.current = null;
			}
			analyserRef.current = null;
			setVolume(0);
			return;
		}

		const startAnalysis = async () => {
			try {
				const stream = await navigator.mediaDevices.getUserMedia({
					audio: true,
				});
				streamRef.current = stream;

				const audioContext = new AudioContext();
				audioContextRef.current = audioContext;

				const analyser = audioContext.createAnalyser();
				analyser.fftSize = 256;
				analyserRef.current = analyser;

				const source = audioContext.createMediaStreamSource(stream);
				source.connect(analyser);

				const dataArray = new Uint8Array(analyser.frequencyBinCount);

				const updateVolume = () => {
					if (!analyserRef.current || !isListening) return;

					analyserRef.current.getByteFrequencyData(dataArray);

					const average =
						dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
					const normalizedVolume = Math.min(average / 128, 1);

					setVolume(normalizedVolume);
					animationFrameRef.current = requestAnimationFrame(updateVolume);
				};

				updateVolume();
			} catch {
				setVolume(0);
			}
		};

		startAnalysis();

		return () => {
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [isListening, hasPermission]);

	return volume;
}

interface UseSpeechOptions {
	mode: VoiceInputMode;
	voiceEnabled: boolean;
	voiceRate: number;
	onFinalTranscript: (text: string) => void;
}

export function useSpeech({
	mode,
	voiceEnabled,
	voiceRate,
	onFinalTranscript,
}: UseSpeechOptions) {
	const [isListening, setIsListening] = useState(false);
	const [isSpeaking, setIsSpeaking] = useState(false);
	const [interimTranscript, setInterimTranscript] = useState("");
	const [finalTranscript, setFinalTranscript] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);

	const volume = useAudioVolume(isListening, hasPermission);

	const recognizerRef = useRef<SpeechRecognizer | null>(null);
	const synthesizerRef = useRef<SpeechSynthesizer | null>(null);
	const onFinalTranscriptRef = useRef(onFinalTranscript);
	const startListeningRef = useRef<() => void>(() => {});

	useEffect(() => {
		onFinalTranscriptRef.current = onFinalTranscript;
	}, [onFinalTranscript]);

	useEffect(() => {
		if (!SpeechRecognizer.isSupported()) {
			setError("음성 인식을 지원하지 않는 브라우저입니다.");
			return;
		}

		recognizerRef.current = new SpeechRecognizer({
			onResult: (text, isFinal) => {
				if (isFinal) {
					setFinalTranscript((prev) => {
						const newText = prev ? `${prev} ${text}` : text;
						return newText;
					});
					setInterimTranscript("");

					if (text.trim()) {
						onFinalTranscriptRef.current(text.trim());
					}
				} else {
					setInterimTranscript(text);
				}
			},
			onError: (err) => {
				if (err === "not-allowed" || err === "service-not-allowed") {
					setHasPermission(false);
					setIsListening(false);
					setError("마이크 권한이 필요합니다. 브라우저 설정에서 허용해주세요.");
					return;
				}
				setError(`음성 인식 오류: ${err}`);
				setIsListening(false);
			},
		});

		synthesizerRef.current = new SpeechSynthesizer({
			onStart: () => setIsSpeaking(true),
			onEnd: () => {
				setIsSpeaking(false);
				if (mode === "auto" && hasPermission) {
					startListeningRef.current();
				}
			},
			onError: (err) => {
				if (err !== "interrupted") {
					console.error("[오답노트] 음성 합성 오류:", err);
				}
				setIsSpeaking(false);
			},
		});

		return () => {
			recognizerRef.current?.stop();
			synthesizerRef.current?.stop();
		};
	}, [hasPermission, mode]);

	const recheckPermission = useCallback(async () => {
		if (hasPermission === true) return;

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			for (const track of stream.getTracks()) track.stop();
			console.log("[오답노트] 권한 재확인: 허용됨");
			setHasPermission(true);
			setError(null);
		} catch {}
	}, [hasPermission]);

	useEffect(() => {
		const handleFocus = () => {
			recheckPermission();
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				recheckPermission();
			}
		};

		window.addEventListener("focus", handleFocus);
		document.addEventListener("visibilitychange", handleVisibilityChange);

		return () => {
			window.removeEventListener("focus", handleFocus);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
		};
	}, [recheckPermission]);

	const requestPermission = useCallback(async () => {
		setError(null);
		console.log("[오답노트] 마이크 권한 요청 시작...");

		try {
			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			console.log("[오답노트] 마이크 권한 획득 성공!");
			for (const track of stream.getTracks()) track.stop();
			setHasPermission(true);
			return true;
		} catch (err) {
			const isDOMException = (e: unknown): e is DOMException =>
				e instanceof DOMException;

			if (!isDOMException(err)) {
				setError("알 수 없는 마이크 오류가 발생했습니다.");
				setHasPermission(false);
				return false;
			}

			console.log(
				"[오답노트] 직접 권한 요청 실패, 권한 페이지로 이동:",
				err.name,
			);

			if (err.name === "NotAllowedError" && err.message.includes("dismissed")) {
				const permissionUrl = browser.runtime.getURL("/permission.html");
				window.open(permissionUrl, "_blank");
				setError("새 탭에서 마이크 권한을 허용한 후 돌아와주세요.");
				return false;
			}

			if (err.name === "NotAllowedError") {
				setError("권한이 거부되었습니다. 다시 시도해주세요.");
			} else if (err.name === "NotFoundError") {
				setError("마이크를 찾을 수 없습니다.");
			} else {
				setError(`마이크 오류: ${err.message}`);
			}

			setHasPermission(false);
			return false;
		}
	}, []);

	const startListening = useCallback(async () => {
		if (isSpeaking) return;

		if (hasPermission === false) {
			setError("마이크 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.");
			return;
		}

		if (hasPermission === null) {
			const granted = await requestPermission();
			if (!granted) return;
		}

		setIsListening(true);
		setError(null);
		recognizerRef.current?.start();
	}, [isSpeaking, hasPermission, requestPermission]);

	useEffect(() => {
		startListeningRef.current = startListening;
	}, [startListening]);

	const stopListening = useCallback(() => {
		setIsListening(false);
		recognizerRef.current?.stop();
	}, []);

	const speak = useCallback(
		(text: string) => {
			if (!voiceEnabled) {
				return;
			}

			stopListening();
			synthesizerRef.current?.speak(text, voiceRate);
		},
		[voiceEnabled, voiceRate, stopListening],
	);

	const stopSpeaking = useCallback(() => {
		synthesizerRef.current?.stop();
		setIsSpeaking(false);
	}, []);

	const toggleListening = useCallback(async () => {
		if (isListening) {
			stopListening();
		} else {
			await startListening();
		}
	}, [isListening, startListening, stopListening]);

	const clearTranscript = useCallback(() => {
		setFinalTranscript("");
		setInterimTranscript("");
	}, []);

	return {
		isListening,
		isSpeaking,
		finalTranscript,
		interimTranscript,
		volume,
		error,
		hasPermission,
		startListening,
		stopListening,
		toggleListening,
		speak,
		stopSpeaking,
		requestPermission,
		clearTranscript,
		isSupported:
			SpeechRecognizer.isSupported() && SpeechSynthesizer.isSupported(),
	};
}
