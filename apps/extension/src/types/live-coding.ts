export type AIProvider = "openai" | "claude";

export type ProgrammingLanguage =
	| "python"
	| "java"
	| "javascript"
	| "cpp"
	| "csharp"
	| "kotlin"
	| "swift"
	| "go"
	| "rust"
	| "unknown";

export type InterviewerStyle = "friendly" | "normal" | "pressure";

export type InterviewStatus = "idle" | "active" | "completed";

export type MessageRole = "interviewer" | "user" | "system";

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
	language: ProgrammingLanguage;
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
	timeLimit: number;
	interviewerStyle: InterviewerStyle;
	language: ProgrammingLanguage;
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
	voiceEnabled: boolean;
}

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
	isMicOn: boolean;
	isInterviewerSpeaking: boolean;
	finalTranscript: string;
	liveTranscript: string;
}

export interface AIClient {
	chat(
		messages: { role: string; content: string }[],
		options?: { maxTokens?: number; jsonMode?: boolean },
	): Promise<AIResponse>;
	testConnection(): Promise<boolean>;
}
