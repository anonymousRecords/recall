// AI 제공자
export type AIProvider = "openai" | "claude";

// 면접관 스타일
export type InterviewerStyle = "friendly" | "normal" | "pressure";

// 세션 상태
export type SessionStatus = "idle" | "active" | "completed";

// 메시지 역할
export type MessageRole = "interviewer" | "user" | "system";

// 음성 입력 방식
export type VoiceInputMode = "push-to-talk" | "auto";

// 문제 정보 (프로그래머스)
export interface ProblemInfo {
	title: string;
	level: number;
	description: string;
	constraints: string[];
	examples: {
		input: string;
		output: string;
	}[];
	url: string;
}

// 코드 스냅샷
export interface CodeSnapshot {
	code: string;
	language: string;
	timestamp: number;
}

// 대화 메시지
export interface ChatMessage {
	id: string;
	role: MessageRole;
	content: string;
	timestamp: number;
	codeContext?: string;
}

// 세션 설정
export interface SessionConfig {
	problemInfo: ProblemInfo;
	timeLimit: number | null;
	style: InterviewerStyle;
	language: string;
}

// 세션 리포트
export interface SessionReport {
	duration: number;
	messageCount: number;
	scores: {
		understanding: number;
		communication: number;
		codeQuality: number;
		timeManagement: number;
	};
	feedback: string[];
	strengths: string[];
	improvements: string[];
}

// 라이브 세션 기록
export interface LiveSession {
	id: string;
	config: SessionConfig;
	status: SessionStatus;
	messages: ChatMessage[];
	codeSnapshots: CodeSnapshot[];
	startedAt: string;
	endedAt?: string;
	report?: SessionReport;
}

// 라이브 코딩 설정
export interface LiveCodingSettings {
	id: "live-coding-settings";
	aiProvider: AIProvider;
	apiKey: string;
	defaultTimeLimit: number;
	defaultStyle: InterviewerStyle;
	autoRegisterProblem: boolean;
	voiceInputMode: VoiceInputMode;
	voiceEnabled: boolean;
	voiceRate: number;
}

// 메시지 타입 (Content Script ↔ SidePanel 통신)
export type LiveCodingMessageType =
	| { type: "GET_PROBLEM_INFO" }
	| { type: "PROBLEM_INFO"; payload: ProblemInfo | null }
	| { type: "START_CODE_MONITOR" }
	| { type: "STOP_CODE_MONITOR" }
	| { type: "CODE_CHANGED"; payload: { code: string; language: string } }
	| { type: "CODE_RUN" }
	| { type: "CODE_SUBMIT" };

// AI 요청 타입
export type AIRequest =
	| { type: "greeting"; problemInfo: ProblemInfo; style: InterviewerStyle }
	| {
			type: "user_message";
			content: string;
			codeContext: string;
			messages: ChatMessage[];
			problemInfo: ProblemInfo;
			style: InterviewerStyle;
	  }
	| {
			type: "code_changed";
			previousCode: string;
			currentCode: string;
			pauseDuration: number;
			messages: ChatMessage[];
			problemInfo: ProblemInfo;
			style: InterviewerStyle;
	  }
	| {
			type: "generate_report";
			messages: ChatMessage[];
			finalCode: string;
			duration: number;
			problemInfo: ProblemInfo;
	  };

// AI 클라이언트 인터페이스
export interface AIClient {
	chat(messages: { role: string; content: string }[]): Promise<string>;
	testConnection(): Promise<boolean>;
}
