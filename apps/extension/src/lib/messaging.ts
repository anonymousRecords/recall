import { defineExtensionMessaging } from "@webext-core/messaging";
import type { ProblemInfo } from "../types";

interface ProtocolMap {
	GET_PROBLEM_INFO(): ProblemInfo | null;
	GET_CURRENT_CODE(): { code: string; language: string } | null;
	START_CODE_MONITOR(): boolean;
	STOP_CODE_MONITOR(): boolean;
	CODE_CHANGED(data: { code: string; language: string }): void;
}

export const { sendMessage, onMessage } =
	defineExtensionMessaging<ProtocolMap>();
