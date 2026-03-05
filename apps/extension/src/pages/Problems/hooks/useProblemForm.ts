import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import {
	createProblem,
	getProblem,
	updateProblem,
} from "../../../lib/db/problems";
import { posthog } from "../../../lib/posthog";
import { extractSiteFromUrl } from "../../../lib/utils";
import { queryKeys } from "../../../queries/keys";
import type { ProblemStatus } from "../../../types";

export type ProblemForm = {
	title: string;
	link: string;
	site: string;
	difficulty: string;
	tags: string[];
	memo: string;
	status: ProblemStatus;
};

const INITIAL_FORM: ProblemForm = {
	title: "",
	link: "",
	site: "",
	difficulty: "",
	tags: [],
	memo: "",
	status: "active",
};

export function useProblemForm(id?: string) {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const isNew = !id || id === "new";

	const invalidate = () =>
		queryClient.invalidateQueries({ queryKey: queryKeys.problems.all });

	const { mutateAsync: addProblem } = useMutation({
		mutationFn: createProblem,
		onSuccess: (_, input) => {
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
		mutationFn: ({
			id,
			input,
		}: {
			id: string;
			input: Parameters<typeof updateProblem>[1];
		}) => updateProblem(id, input),
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
	const [createdAt, setCreatedAt] = useState<string | null>(null);
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
				});

				setCreatedAt(problem.createdAt);
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
					await addProblem({ ...base, status: "active" });
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
		createdAt,
		updateField,
		handleLinkChange,
		handleSubmit,
		handleCancel,
	};
}
