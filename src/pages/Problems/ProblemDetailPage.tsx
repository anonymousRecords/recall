import { format } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { TagInput } from "../../components/shared";
import { Button, Input, Select, Textarea } from "../../components/ui";
import { useProblems } from "../../hooks";
import { getProblem } from "../../lib/db/problems";
import { extractSiteFromUrl } from "../../lib/utils";
import type { CreateProblemInput, Problem } from "../../types";

const DIFFICULTY_OPTIONS = [
	{ value: "", label: "난이도 선택 (선택)" },
	{ value: "쉬움", label: "쉬움" },
	{ value: "보통", label: "보통" },
	{ value: "어려움", label: "어려움" },
];

const STATUS_OPTIONS = [
	{ value: "active", label: "진행중" },
	{ value: "archived", label: "보관" },
	{ value: "completed", label: "완료" },
];

export function ProblemDetailPage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const { addProblem, editProblem } = useProblems();

	const isNew = !id || id === "new";

	const [loading, setLoading] = useState(!isNew);
	const [saving, setSaving] = useState(false);
	const [createdAt, setCreatedAt] = useState<string | null>(null);
	const [form, setForm] = useState<{
		title: string;
		link: string;
		site: string;
		difficulty: string;
		tags: string[];
		memo: string;
		status: Problem["status"];
	}>({
		title: "",
		link: "",
		site: "",
		difficulty: "",
		tags: [],
		memo: "",
		status: "active",
	});

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

	const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const link = e.target.value;
		setForm((prev) => ({
			...prev,
			link,
			site: prev.site || extractSiteFromUrl(link),
		}));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!form.title.trim() || !form.link.trim()) {
			return;
		}

		setSaving(true);

		try {
			if (isNew) {
				const input: CreateProblemInput = {
					title: form.title.trim(),
					link: form.link.trim(),
					site: form.site.trim() || extractSiteFromUrl(form.link),
					difficulty: form.difficulty || undefined,
					tags: form.tags,
					memo: form.memo.trim(),
					status: "active",
				};
				await addProblem(input);
			} else {
				await editProblem(id, {
					title: form.title.trim(),
					link: form.link.trim(),
					site: form.site.trim(),
					difficulty: form.difficulty || undefined,
					tags: form.tags,
					memo: form.memo.trim(),
					status: form.status,
				});
			}
			navigate("/problems");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="flex h-full items-center justify-center">
				<div className="flex items-center gap-2 text-neutral-400">
					<LoadingSpinner />
					<span className="text-sm">불러오는 중...</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col bg-white dark:bg-neutral-950">
			<header className="border-b border-neutral-200/60 bg-white px-4 py-4 dark:border-neutral-800 dark:bg-neutral-950">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="rounded-md p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
					>
						<BackButtonIcon />
					</button>
					<h1 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
						{isNew ? "새 문제 등록" : "문제 수정"}
					</h1>
				</div>
			</header>
			<form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
				{createdAt && (
					<div className="mb-4 flex justify-end">
						<span className="text-xs text-neutral-400 dark:text-neutral-500">
							{format(new Date(createdAt), "yyyy년 M월 d일")} 등록
						</span>
					</div>
				)}
				<div className="space-y-5">
					<Input
						id="title"
						label="문제 제목"
						placeholder="문제 제목을 입력하세요"
						value={form.title}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, title: e.target.value }))
						}
						required
					/>

					<Input
						id="link"
						label="문제 링크"
						type="url"
						placeholder="https://..."
						value={form.link}
						onChange={handleLinkChange}
						required
					/>

					<Input
						id="site"
						label="사이트"
						placeholder="프로그래머스, LeetCode 등"
						value={form.site}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, site: e.target.value }))
						}
						hint="링크에서 자동으로 감지됩니다"
					/>

					<Select
						id="difficulty"
						label="난이도"
						options={DIFFICULTY_OPTIONS}
						value={form.difficulty}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, difficulty: e.target.value }))
						}
					/>

					<TagInput
						label="태그"
						value={form.tags}
						onChange={(tags) => setForm((prev) => ({ ...prev, tags }))}
					/>

					<Textarea
						id="memo"
						label="메모"
						placeholder="틀린 이유, 풀이 전략 등을 기록하세요"
						value={form.memo}
						onChange={(e) =>
							setForm((prev) => ({ ...prev, memo: e.target.value }))
						}
						rows={4}
					/>

					{!isNew && (
						<Select
							id="status"
							label="상태"
							options={STATUS_OPTIONS}
							value={form.status}
							onChange={(e) =>
								setForm((prev) => ({
									...prev,
									status: e.target.value as Problem["status"],
								}))
							}
						/>
					)}
				</div>

				<div className="mt-8 flex gap-3">
					<Button
						type="button"
						variant="secondary"
						className="flex-1"
						onClick={() => navigate(-1)}
					>
						취소
					</Button>
					<Button type="submit" className="flex-1" disabled={saving}>
						{saving ? "저장 중..." : isNew ? "등록" : "저장"}
					</Button>
				</div>
			</form>
		</div>
	);
}

function LoadingSpinner() {
	return (
		<svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
			<circle
				className="opacity-25"
				cx="12"
				cy="12"
				r="10"
				stroke="currentColor"
				strokeWidth="4"
			/>
			<path
				className="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
	);
}

function BackButtonIcon() {
	return (
		<svg
			role="img"
			aria-label="BackButton"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			strokeWidth="1.5"
			stroke="currentColor"
			className="h-5 w-5"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				d="M15.75 19.5 8.25 12l7.5-7.5"
			/>
		</svg>
	);
}
