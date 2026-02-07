interface SpeechRecognitionResultItem {
	readonly transcript: string;
	readonly confidence: number;
}

interface SpeechRecognitionResultEntry {
	readonly isFinal: boolean;
	readonly length: number;
	[index: number]: SpeechRecognitionResultItem;
}

interface SpeechRecognitionResultsList {
	readonly length: number;
	[index: number]: SpeechRecognitionResultEntry;
}

interface SpeechRecognitionResultEvent {
	readonly results: SpeechRecognitionResultsList;
}

interface SpeechRecognitionErrorResultEvent {
	readonly error: string;
}

interface SpeechRecognitionInstance {
	lang: string;
	continuous: boolean;
	interimResults: boolean;
	onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
	onerror: ((event: SpeechRecognitionErrorResultEvent) => void) | null;
	onend: (() => void) | null;
	start(): void;
	stop(): void;
}

interface SpeechRecognitionConstructor {
	new (): SpeechRecognitionInstance;
}

declare global {
	interface Window {
		SpeechRecognition: SpeechRecognitionConstructor;
		webkitSpeechRecognition: SpeechRecognitionConstructor;
	}
}

interface SpeechRecognizerOptions {
	onResult: (text: string, isFinal: boolean) => void;
	onError: (error: string) => void;
	onEnd?: () => void;
}

export class SpeechRecognizer {
	private recognition: SpeechRecognitionInstance | null = null;
	private isListening = false;
	private onResult: (text: string, isFinal: boolean) => void;
	private onError: (error: string) => void;
	private onEnd?: () => void;

	constructor(options: SpeechRecognizerOptions) {
		this.onResult = options.onResult;
		this.onError = options.onError;
		this.onEnd = options.onEnd;

		this.initialize();
	}

	private initialize() {
		const SpeechRecognitionAPI =
			window.SpeechRecognition || window.webkitSpeechRecognition;

		if (!SpeechRecognitionAPI) {
			console.error(
				"[오답노트] Speech Recognition API를 지원하지 않는 브라우저입니다.",
			);
			return;
		}

		this.recognition = new SpeechRecognitionAPI();
		this.recognition.lang = "ko-KR";
		this.recognition.continuous = true;
		this.recognition.interimResults = true;

		this.recognition.onresult = (event) => {
			const lastIndex = event.results.length - 1;
			const result = event.results[lastIndex];
			const text = result[0].transcript;
			const isFinal = result.isFinal;

			this.onResult(text, isFinal);
		};

		this.recognition.onerror = (event) => {
			const ignoredErrors = ["no-speech", "aborted"];
			if (ignoredErrors.includes(event.error)) return;

			const permissionErrors = ["not-allowed", "service-not-allowed"];
			if (permissionErrors.includes(event.error)) {
				this.isListening = false;
			}

			this.onError(event.error);
		};

		this.recognition.onend = () => {
			this.onEnd?.();

			if (this.isListening) {
				try {
					this.recognition?.start();
				} catch {}
			}
		};
	}

	start() {
		if (!this.recognition) {
			this.onError("Speech Recognition을 사용할 수 없습니다.");
			return;
		}

		if (this.isListening) return;

		this.isListening = true;
		try {
			this.recognition.start();
		} catch {}
	}

	stop() {
		this.isListening = false;
		this.recognition?.stop();
	}

	get listening() {
		return this.isListening;
	}

	static isSupported(): boolean {
		return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
	}
}
