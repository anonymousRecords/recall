import {
	useMutation,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query";
import {
	createProblem,
	deleteProblem,
	updateProblem,
} from "../lib/db/problems";
import { queryKeys } from "../queries/keys";
import { problemsQueryOptions } from "../queries/problems";
import type { CreateProblemInput, UpdateProblemInput } from "../types";

export function useProblems() {
	const { data: problems } = useSuspenseQuery(problemsQueryOptions());
	const queryClient = useQueryClient();

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });

	const { mutateAsync: addProblem } = useMutation({
		mutationFn: (input: CreateProblemInput) => createProblem(input),
		onSuccess: invalidate,
	});

	const { mutateAsync: editProblem } = useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateProblemInput }) =>
			updateProblem(id, input),
		onSuccess: invalidate,
	});

	const { mutateAsync: removeProblem } = useMutation({
		mutationFn: (id: string) => deleteProblem(id),
		onSuccess: invalidate,
	});

	return { problems, addProblem, editProblem, removeProblem };
}
