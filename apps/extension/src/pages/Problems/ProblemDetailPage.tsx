import { format } from "date-fns";
import { useParams } from "react-router";
import { PageLayout } from "../../components/layout";
import { TagInput } from "../../components/shared";
import { Button, Input, Select, Textarea } from "../../components/ui";
import { type DateString, toDateString } from "../../lib/utils";
import type { ProblemStatus } from "../../types";
import { type ProblemForm, useProblemForm } from "./hooks/useProblemForm";

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

	const {
		form,
		isNew,
		loading,
		saving,
		createdAt,
		updateField,
		handleLinkChange,
		handleSubmit,
		handleCancel,
	} = useProblemForm(id);

	if (loading) {
		return null;
	}

	return (
		<PageLayout
			header={<ProblemDetailPageHeader isNew={isNew} onBack={handleCancel} />}
		>
			<form onSubmit={handleSubmit} className="flex-1 overflow-auto p-4">
				{createdAt && <RegistrationDate createdAt={createdAt} />}

				<ProblemFormFields
					form={form}
					isNew={isNew}
					updateField={updateField}
					handleLinkChange={handleLinkChange}
				/>

				<FormFieldActions
					isNew={isNew}
					saving={saving}
					handleCancel={handleCancel}
				/>
			</form>
		</PageLayout>
	);
}

interface ProblemFormFieldsProps {
	form: ProblemForm;
	isNew: boolean;
	updateField: <K extends keyof ProblemForm>(
		key: K,
		value: ProblemForm[K],
	) => void;
	handleLinkChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function ProblemFormFields({
	form,
	isNew,
	updateField,
	handleLinkChange,
}: ProblemFormFieldsProps) {
	return (
		<div className="space-y-5">
			<Input
				id="title"
				label="문제 제목"
				placeholder="문제 제목을 입력하세요"
				value={form.title}
				onChange={(e) => updateField("title", e.target.value)}
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
				onChange={(e) => updateField("site", e.target.value)}
				hint="링크에서 자동으로 감지됩니다"
			/>

			<Select
				id="difficulty"
				label="난이도"
				options={DIFFICULTY_OPTIONS}
				value={form.difficulty}
				onChange={(e) => updateField("difficulty", e.target.value)}
			/>

			<TagInput
				label="태그"
				value={form.tags}
				onChange={(tags) => updateField("tags", tags)}
			/>

			<Textarea
				id="memo"
				label="메모"
				placeholder="틀린 이유, 풀이 전략 등을 기록하세요"
				value={form.memo}
				onChange={(e) => updateField("memo", e.target.value)}
				rows={4}
			/>

			{isNew && (
				<Input
					id="registrationDate"
					label="등록 날짜"
					type="date"
					value={form.registrationDate}
					onChange={(e) => updateField("registrationDate", e.target.value as DateString)}
					hint="문제를 실제로 푼 날짜를 입력하세요"
					max={toDateString(new Date())}
				/>
			)}

			{!isNew && (
				<Select
					id="status"
					label="상태"
					options={STATUS_OPTIONS}
					value={form.status}
					onChange={(e) =>
						updateField("status", e.target.value as ProblemStatus)
					}
				/>
			)}
		</div>
	);
}

interface RegistrationDateProps {
	createdAt: string;
}

function RegistrationDate({ createdAt }: RegistrationDateProps) {
	return (
		<div className="mb-4 flex justify-end">
			<span className="font-mono text-[11px] text-[#858585]">
				{format(new Date(createdAt), "yyyy.MM.dd")} 등록
			</span>
		</div>
	);
}

interface ProblemDetailPageHeaderProps {
	isNew: boolean;
	onBack: () => void;
}

function ProblemDetailPageHeader({
	isNew,
	onBack,
}: ProblemDetailPageHeaderProps) {
	return (
		<div className="flex items-center gap-3 px-4 py-3">
			<button
				type="button"
				onClick={onBack}
				className="font-mono text-[12px] text-[#858585] transition-colors hover:text-[#d4d4d4]"
			>
				[ ← ]
			</button>
			<p className="font-mono text-[11px] text-[#858585]">
				{`// ${isNew ? "new problem" : "edit problem"}`}
			</p>
		</div>
	);
}

interface FormFieldActionsProps {
	isNew: boolean;
	saving: boolean;
	handleCancel: () => void;
}

function FormFieldActions({
	isNew,
	saving,
	handleCancel,
}: FormFieldActionsProps) {
	return (
		<div className="mt-8 flex gap-3">
			<Button
				type="button"
				variant="secondary"
				className="flex-1"
				onClick={handleCancel}
			>
				취소
			</Button>
			<Button type="submit" className="flex-1" disabled={saving}>
				{saving ? "저장 중..." : isNew ? "등록" : "저장"}
			</Button>
		</div>
	);
}
