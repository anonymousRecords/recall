interface TextToSpeechOptions {
	onStart: () => void;
	onEnd: () => void;
	onError: (error: string) => void;
}

export function createTextToSpeech({
	onStart,
	onEnd,
	onError,
}: TextToSpeechOptions) {
	const synth = window.speechSynthesis;
	let voice: SpeechSynthesisVoice | null = null;

	const setVoice = () => {
		const voices = synth.getVoices();

		voice =
			voices.find((v) => v.lang.startsWith("ko")) ||
			voices.find((v) => v.lang.startsWith("en")) ||
			voices[0] ||
			null;
	};

	if (synth.getVoices().length > 0) {
		setVoice();
	} else {
		synth.onvoiceschanged = setVoice;
	}

	const createUtterance = (text: string, rate: number) => {
		const utterance = new SpeechSynthesisUtterance(text);

		if (voice) {
			utterance.voice = voice;
		}

		utterance.lang = "ko-KR";
		utterance.rate = Math.max(0.5, Math.min(2.0, rate)); // 0.5 ~ 2.0
		utterance.pitch = 1.0;
		utterance.volume = 1.0;

		utterance.onstart = () => onStart();
		utterance.onend = () => onEnd();
		utterance.onerror = (event) => {
			if (event.error === "canceled") {
				return;
			}
			onError(event.error);
		};

		return utterance;
	};

	return {
		speak(text: string, rate = 1.0) {
			synth.cancel();
			synth.speak(createUtterance(text, rate));
		},

		stop() {
			synth.cancel();
		},

		pause() {
			synth.pause();
		},

		resume() {
			synth.resume();
		},

		get speaking() {
			return synth.speaking;
		},

		get paused() {
			return synth.paused;
		},
	};
}
