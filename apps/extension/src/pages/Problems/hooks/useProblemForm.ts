import { useMutation, useQueryClient } from "@tanstack/react-query";
import { min, parseISO } from "date-fns";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
	createProblem,
	getProblem,
	updateProblem,
} from "../../../lib/db/problems";
import { posthog } from "../../../lib/posthog";
import {
	type DateString,
	extractSiteFromUrl,
	toDateString,
} from "../../../lib/utils";
import { queryKeys } from "../../../queries/keys";
import type { CreateProblemInput, ProblemStatus } from "../../../types";

type AddProblemParams = {
	input: CreateProblemInput & { status: ProblemStatus };
	createdAt?: DateString;
};

type EditProblemParams = {
	id: string;
	input: Parameters<typeof updateProblem>[1];
};

export function useProblemForm(id: string | undefined) {
	const navigate = useNavigate();

	const isNew = id === undefined;

	const queryClient = useQueryClient();

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });

	const { mutateAsync: addProblem } = useMutation({
		mutationFn: ({ input, createdAt }: AddProblemParams) =>
			createProblem(input, createdAt),
		onSuccess: (_, { input }) => {
			posthog.capture("problem_created", {
				site: input.site,
				difficulty: input.difficulty ?? null,
				has_tags: input.tags.length > 0,
				has_memo: input.memo.trim().length > 0,
			});
			invalidate();
		},
	});

	const { mutateAsync: editProblem } = useMutation({
		mutationFn: ({ id, input }: EditProblemParams) => updateProblem(id, input),
		onSuccess: (_, { input }) => {
			posthog.capture("problem_updated", {
				site: input.site ?? null,
				difficulty: input.difficulty ?? null,
				status: input.status ?? null,
			});
			invalidate();
		},
	});

	const [loading, setLoading] = useState(!isNew);
	const [saving, setSaving] = useState(false);
	const [form, setForm] = useState<ProblemForm>(INITIAL_FORM);

	useEffect(() => {
		if (isNew) return;

		const loadProblem = async () => {
			setLoading(true);

			const problem = await getProblem(id);

			if (problem) {
				setForm({
					title: problem.title,
					link: problem.link,
					site: problem.site,
					difficulty: problem.difficulty ?? "",
					tags: problem.tags,
					memo: problem.memo,
					status: problem.status,
					registrationDate: toDateString(new Date(problem.createdAt)),
				});
			}
			setLoading(false);
		};

		loadProblem();
	}, [id, isNew]);

	const updateField = useCallback(
		<K extends keyof ProblemForm>(key: K, value: ProblemForm[K]) => {
			setForm((prev) => ({ ...prev, [key]: value }));
		},
		[],
	);

	const handleLinkChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const link = e.target.value;
			setForm((prev) => ({
				...prev,
				link,
				site: prev.site || extractSiteFromUrl(link),
			}));
		},
		[],
	);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			if (!form.title.trim() || !form.link.trim()) return;

			setSaving(true);

			try {
				const base = {
					title: form.title.trim(),
					link: form.link.trim(),
					site: form.site.trim() || extractSiteFromUrl(form.link),
					difficulty: form.difficulty || undefined,
					tags: form.tags,
					memo: form.memo.trim(),
				};

				if (isNew) {
					const today = toDateString(new Date());
					const registrationDate = form.registrationDate
						? toDateString(min([parseISO(form.registrationDate), new Date()]))
						: today;
					await addProblem({
						input: { ...base, status: "active" },
						createdAt: registrationDate,
					});
				} else {
					await editProblem({ id, input: { ...base, status: form.status } });
				}
				navigate("/problems");
			} finally {
				setSaving(false);
			}
		},
		[form, isNew, id, addProblem, editProblem, navigate],
	);

	const handleCancel = useCallback(() => {
		navigate(-1);
	}, [navigate]);

	return {
		form,
		isNew,
		loading,
		saving,
		updateField,
		handleLinkChange,
		handleSubmit,
		handleCancel,
	};
}

export type ProblemForm = {
	title: string;
	link: string;
	site: string;
	difficulty: string;
	tags: string[];
	memo: string;
	status: ProblemStatus;
	registrationDate: DateString;
};

const INITIAL_FORM: ProblemForm = {
	title: "",
	link: "",
	site: "",
	difficulty: "",
	tags: [],
	memo: "",
	status: "active",
	registrationDate: toDateString(new Date()),
};
