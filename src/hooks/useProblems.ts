import { useCallback, useEffect, useState } from "react";
import {
	createProblem,
	deleteProblem,
	getAllProblems,
	getProblem,
	updateProblem,
} from "../lib/db/problems";
import type { CreateProblemInput, Problem, UpdateProblemInput } from "../types";

export function useProblems() {
	const [problems, setProblems] = useState<Problem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const fetchProblems = useCallback(async () => {
		try {
			setLoading(true);
			const data = await getAllProblems();
			setProblems(data);
			setError(null);
		} catch (err) {
			setError(
				err instanceof Error ? err : new Error("Failed to fetch problems"),
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchProblems();
	}, [fetchProblems]);

	const addProblem = useCallback(async (input: CreateProblemInput) => {
		const newProblem = await createProblem(input);
		setProblems((prev) => [newProblem, ...prev]);
		return newProblem;
	}, []);

	const editProblem = useCallback(
		async (id: string, input: UpdateProblemInput) => {
			const updated = await updateProblem(id, input);
			if (updated) {
				setProblems((prev) => prev.map((p) => (p.id === id ? updated : p)));
			}
			return updated;
		},
		[],
	);

	const removeProblem = useCallback(async (id: string) => {
		await deleteProblem(id);
		setProblems((prev) => prev.filter((p) => p.id !== id));
	}, []);

	const refreshProblem = useCallback(async (id: string) => {
		const updated = await getProblem(id);
		if (updated) {
			setProblems((prev) => prev.map((p) => (p.id === id ? updated : p)));
		}
		return updated;
	}, []);

	return {
		problems,
		loading,
		error,
		addProblem,
		editProblem,
		removeProblem,
		refreshProblem,
		refetch: fetchProblems,
	};
}
