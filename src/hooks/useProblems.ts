import { useCallback, useMemo } from "react";
import {
	createProblem,
	deleteProblem,
	getAllProblems,
	getProblem,
	updateProblem,
} from "../lib/db/problems";
import type { CreateProblemInput, Problem, UpdateProblemInput } from "../types";
import { useAsyncData } from "./useAsyncData";

export function useProblems() {
	const {
		data: problems,
		loading,
		error,
		refetch,
		setData,
	} = useAsyncData<Problem[]>(getAllProblems, []);

	const addProblem = useCallback(
		async (input: CreateProblemInput) => {
			const newProblem = await createProblem(input);
			setData((prev) => [newProblem, ...prev]);
			return newProblem;
		},
		[setData],
	);

	const editProblem = useCallback(
		async (id: string, input: UpdateProblemInput) => {
			const updated = await updateProblem(id, input);
			if (updated) {
				setData((prev) => prev.map((p) => (p.id === id ? updated : p)));
			}
			return updated;
		},
		[setData],
	);

	const removeProblem = useCallback(
		async (id: string) => {
			await deleteProblem(id);
			setData((prev) => prev.filter((p) => p.id !== id));
		},
		[setData],
	);

	const refreshProblem = useCallback(
		async (id: string) => {
			const updated = await getProblem(id);
			if (updated) {
				setData((prev) => prev.map((p) => (p.id === id ? updated : p)));
			}
			return updated;
		},
		[setData],
	);

	return useMemo(
		() => ({
			problems,
			loading,
			error,
			addProblem,
			editProblem,
			removeProblem,
			refreshProblem,
			refetch,
		}),
		[
			problems,
			loading,
			error,
			addProblem,
			editProblem,
			removeProblem,
			refreshProblem,
			refetch,
		],
	);
}
