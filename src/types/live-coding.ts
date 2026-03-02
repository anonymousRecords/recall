export type AIProvider = "openai" | "claude";

export type InterviewerStyle = "friendly" | "normal" | "pressure";

export type InterviewStatus = "idle" | "active" | "completed";

export type MessageRole = "interviewer" | "user" | "system";

export type VoiceInputMode = "push-to-talk" | "auto";

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

export interface CodeSnapshot {
	code: string;
	language: string;
	timestamp: number;
}

export interface ChatMessage {
	id: string;
	role: MessageRole;
	content: string;
	timestamp: number;
	codeContext?: string;
	notes?: string;
}

export interface InterviewConfig {
	problemInfo: ProblemInfo;
	timeLimit: number | null;
	interviewerStyle: InterviewerStyle;
	language: string;
}

export interface AIUsage {
	promptTokens: number;
	completionTokens: number;
}

export interface AIResponse {
	content: string;
	usage: AIUsage;
}

export interface InterviewReport {
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
	supportingQuotes?: { quote: string; analysis: string }[];
	sampleAnswer?: string;
	tokenUsage?: {
		totalPromptTokens: number;
		totalCompletionTokens: number;
		estimatedCost: number;
		provider: AIProvider;
		callCount: number;
	};
}

export interface LiveInterview {
	id: string;
	config: InterviewConfig;
	status: InterviewStatus;
	messages: ChatMessage[];
	codeSnapshots: CodeSnapshot[];
	startedAt: string;
	endedAt?: string;
	report?: InterviewReport;
}

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

export type LiveCodingMessageType =
	| { type: "GET_PROBLEM_INFO" }
	| { type: "PROBLEM_INFO"; payload: ProblemInfo | null }
	| { type: "START_CODE_MONITOR" }
	| { type: "STOP_CODE_MONITOR" }
	| { type: "CODE_CHANGED"; payload: { code: string; language: string } }
	| { type: "CODE_RUN" }
	| { type: "CODE_SUBMIT" };

export type AIRequest =
	| {
			type: "greeting";
			problemInfo: ProblemInfo;
			interviewerStyle: InterviewerStyle;
	  }
	| {
			type: "user_message";
			content: string;
			codeContext: string;
			messages: ChatMessage[];
			problemInfo: ProblemInfo;
			interviewerStyle: InterviewerStyle;
	  }
	| {
			type: "code_changed";
			previousCode: string;
			currentCode: string;
			pauseDuration: number;
			messages: ChatMessage[];
			problemInfo: ProblemInfo;
			interviewerStyle: InterviewerStyle;
	  }
	| {
			type: "generate_report";
			messages: ChatMessage[];
			finalCode: string;
			duration: number;
			problemInfo: ProblemInfo;
	  };

export interface SpeechState {
	isListening: boolean;
	isSpeaking: boolean;
	finalTranscript: string;
	interimTranscript: string;
	volume: number;
	toggleListening: () => void;
}

export interface AIClient {
	chat(
		messages: { role: string; content: string }[],
		options?: { maxTokens?: number },
	): Promise<AIResponse>;
	testConnection(): Promise<boolean>;
}
