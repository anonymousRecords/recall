import { type ReactNode, useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { Button } from "./Button";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: ReactNode;
	className?: string;
}

export function Modal({
	isOpen,
	onClose,
	title,
	children,
	className,
}: ModalProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		if (isOpen) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	}, [isOpen]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;

		const handleClose = () => onClose();
		dialog.addEventListener("close", handleClose);
		return () => dialog.removeEventListener("close", handleClose);
	}, [onClose]);

	const handleBackdropClick = (e: React.MouseEvent) => {
		if (e.target === dialogRef.current) {
			onClose();
		}
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<dialog
			ref={dialogRef}
			className={cn(
				"backdrop:bg-black/50 rounded-lg p-0 border-0",
				"bg-white dark:bg-gray-900 shadow-xl",
				"max-w-lg w-full mx-auto",
				className,
			)}
			onClick={handleBackdropClick}
		>
			<div className="p-6">
				{title && (
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
							{title}
						</h2>
						<Button variant="ghost" size="sm" onClick={onClose}>
							{/** biome-ignore lint/a11y/noSvgWithoutTitle: <explanation> */}
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</Button>
					</div>
				)}
				{children}
			</div>
		</dialog>
	);
}
