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
				<div className="text-gray-500 dark:text-gray-400">로딩 중...</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col h-full">
			<header className="border-b border-gray-200 dark:border-gray-800 px-4 py-3">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
					>
						<BackButtonIcon />
					</button>
					<h1 className="text-lg font-semibold text-gray-900 dark:text-white">
						{isNew ? "새 문제 등록" : "문제 수정"}
					</h1>
				</div>
			</header>
			<form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
				<div className="px-2 flex justify-end">
					{createdAt && (
						<div className="text-sm text-gray-500 dark:text-gray-400">
							CreatedAt {format(new Date(createdAt), "yyyy년 M월 d일")}
						</div>
					)}
				</div>
				<div className="space-y-4">
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

				<div className="mt-6 flex gap-3">
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

function BackButtonIcon() {
	return (
		<svg
			role="img"
			aria-label="BackButton"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			width={24}
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M15.75 19.5 8.25 12l7.5-7.5"
			/>
		</svg>
	);
}
