interface SpeechToTextOptions {
	onResult: (transcript: string, isTranscriptConfirmed: boolean) => void;
	onError: (error: string) => void;
	onEnd?: () => void;
}

export function createSpeechToText({
	onResult,
	onError,
	onEnd,
}: SpeechToTextOptions) {
	let isListening = false;

	const SpeechRecognitionAPI =
		window.SpeechRecognition || window.webkitSpeechRecognition;

	if (!SpeechRecognitionAPI) {
		console.error(
			"[recall] Speech Recognition API를 지원하지 않는 브라우저입니다.",
		);
		return null;
	}

	const recognition = new SpeechRecognitionAPI();

	recognition.lang = "ko-KR";
	recognition.continuous = true; // 음성 인식 결과가 나올 때마다 onresult 이벤트 발생
	recognition.interimResults = true; // 실시간으로 중간 결과 반환

	recognition.onresult = (event) => {
		const lastIndex = event.results.length - 1;
		const result = event.results[lastIndex];

		const transcript = result[0].transcript;
		const isTranscriptConfirmed = result.isFinal;

		onResult(transcript, isTranscriptConfirmed);
	};

	recognition.onerror = (event) => {
		const ignoredErrors = ["no-speech", "aborted"];

		if (ignoredErrors.includes(event.error)) {
			return;
		}

		const permissionErrors = ["not-allowed", "service-not-allowed"];

		if (permissionErrors.includes(event.error)) {
			isListening = false;
		}

		onError(event.error);
	};

	recognition.onend = () => {
		if (onEnd === undefined) {
			return;
		}

		onEnd();

		if (isListening) {
			try {
				recognition.start();
			} catch {
				return;
			}
		}
	};

	return {
		start() {
			if (isListening) {
				return;
			}

			isListening = true;

			try {
				recognition.start();
			} catch {
				return;
			}
		},

		stop() {
			isListening = false;
			recognition.stop();
		},

		get listening() {
			return isListening;
		},
	};
}
