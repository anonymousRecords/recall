interface TextToSpeechOptions {
	onStart?: () => void;
	onEnd?: () => void;
	onError?: (error: string) => void;
}

export class TextToSpeech {
	private synth: SpeechSynthesis;
	private voice: SpeechSynthesisVoice | null = null;
	private onStart?: () => void;
	private onEnd?: () => void;
	private onError?: (error: string) => void;

	constructor(options: TextToSpeechOptions = {}) {
		this.synth = window.speechSynthesis;
		this.onStart = options.onStart;
		this.onEnd = options.onEnd;
		this.onError = options.onError;

		this.loadKoreanVoice();
	}

	private loadKoreanVoice() {
		const setVoice = () => {
			const voices = this.synth.getVoices();
			// 한국어 음성 우선, 없으면 첫 번째 음성
			this.voice =
				voices.find((v) => v.lang.startsWith("ko")) ||
				voices.find((v) => v.lang.startsWith("en")) ||
				voices[0] ||
				null;
		};

		// 음성 목록이 이미 로드되어 있으면 바로 설정
		if (this.synth.getVoices().length > 0) {
			setVoice();
		} else {
			// 음성 목록 로드 대기
			this.synth.onvoiceschanged = setVoice;
		}
	}

	speak(text: string, rate = 1.0) {
		// 이전 발화 중단
		this.synth.cancel();

		const utterance = new SpeechSynthesisUtterance(text);

		if (this.voice) {
			utterance.voice = this.voice;
		}

		utterance.lang = "ko-KR";
		utterance.rate = Math.max(0.5, Math.min(2.0, rate)); // 0.5 ~ 2.0
		utterance.pitch = 1.0;
		utterance.volume = 1.0;

		utterance.onstart = () => {
			this.onStart?.();
		};

		utterance.onend = () => {
			this.onEnd?.();
		};

		utterance.onerror = (event) => {
			// canceled는 의도적인 중단이므로 무시
			if (event.error === "canceled") return;
			this.onError?.(event.error);
		};

		this.synth.speak(utterance);
	}

	stop() {
		this.synth.cancel();
	}

	pause() {
		this.synth.pause();
	}

	resume() {
		this.synth.resume();
	}

	get speaking() {
		return this.synth.speaking;
	}

	get paused() {
		return this.synth.paused;
	}

	static isSupported(): boolean {
		return "speechSynthesis" in window;
	}
}
