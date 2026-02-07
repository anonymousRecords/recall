import { useCallback, useEffect, useRef, useState } from "react";

export function useSessionTimer(
	isActive: boolean,
	onTimeUp: () => void,
) {
	const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
	const onTimeUpRef = useRef(onTimeUp);

	useEffect(() => {
		onTimeUpRef.current = onTimeUp;
	}, [onTimeUp]);

	const isTimerActive = isActive && timeRemaining !== null;

	useEffect(() => {
		if (!isTimerActive) return;

		const interval = setInterval(() => {
			setTimeRemaining((prev) => {
				if (prev === null || prev <= 0) {
					onTimeUpRef.current();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [isTimerActive]);

	const start = useCallback((timeLimitMinutes: number) => {
		setTimeRemaining(timeLimitMinutes * 60);
	}, []);

	const reset = useCallback(() => {
		setTimeRemaining(null);
	}, []);

	return { timeRemaining, start, reset };
}
