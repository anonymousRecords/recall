import { defineExtensionMessaging } from "@webext-core/messaging";
import type { ProblemInfo, ProgrammingLanguage } from "../types";

interface ProtocolMap {
	GET_PROBLEM_INFO(): ProblemInfo | null;
	GET_CURRENT_CODE(): { code: string; language: ProgrammingLanguage } | null;
	START_CODE_MONITOR(): boolean;
	STOP_CODE_MONITOR(): boolean;
	CODE_CHANGED(data: { code: string; language: ProgrammingLanguage }): void;
	PROGRAMMERS_PAGE_LOADED(): void;
}

export const { sendMessage, onMessage } =
	defineExtensionMessaging<ProtocolMap>();
