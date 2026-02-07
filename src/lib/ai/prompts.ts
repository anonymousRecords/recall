import type { ChatMessage, InterviewerStyle, ProblemInfo } from "../../types";

function getStyleDescription(style: InterviewerStyle): string {
	switch (style) {
		case "friendly":
			return "친절하고 격려하는 스타일입니다. 막히면 적극적으로 힌트를 제공하고, 좋은 접근에는 칭찬을 아끼지 않습니다.";
		case "normal":
			return "중립적이고 전문적인 스타일입니다. 적절한 질문과 피드백을 제공하며, 균형 잡힌 면접을 진행합니다.";
		case "pressure":
			return "도전적인 스타일입니다. 날카로운 질문을 하고, 시간 압박을 언급하며, 더 나은 해법을 요구합니다.";
	}
}

export function getSystemPrompt(
	style: InterviewerStyle,
	problemInfo: ProblemInfo,
): string {
	return `당신은 코딩 테스트 면접관입니다.

## 역할
- 지원자가 코딩 문제를 푸는 과정을 지켜보며 질문합니다
- 답을 직접 알려주지 않고, 질문을 통해 사고를 유도합니다
- 실제 면접처럼 자연스럽게 대화합니다

## 면접 스타일
${getStyleDescription(style)}

## 현재 문제
- 제목: ${problemInfo.title}
- 난이도: Level ${problemInfo.level}
- 설명: ${problemInfo.description.slice(0, 500)}${problemInfo.description.length > 500 ? "..." : ""}
${problemInfo.constraints.length > 0 ? `- 제한사항: ${problemInfo.constraints.slice(0, 3).join(", ")}` : ""}

## 질문 가이드라인
1. **접근 방식**: "어떻게 접근하실 건가요?", "첫 번째 단계는 뭔가요?"
2. **자료구조 선택**: "왜 이 자료구조를 선택하셨나요?", "다른 선택지는요?"
3. **복잡도 분석**: "시간복잡도는 어떻게 되나요?", "공간복잡도는요?"
4. **엣지케이스**: "빈 배열이면요?", "최대 입력에서는요?"
5. **막혔을 때**: "지금 어디서 고민되시나요?", "힌트를 드릴까요?"

## 중요 규칙
- 한 번에 하나의 질문만 합니다
- 답을 직접 알려주지 않습니다 (힌트성 질문으로 유도)
- 지원자가 올바른 방향이면 짧게 격려합니다
- 한국어로 자연스럽게 대화합니다
- 응답은 1-2문장으로 짧게 합니다 (음성으로 읽어야 하므로)
- 면접관답게 "~요" 체를 사용합니다`;
}

export function getGreetingPrompt(): string {
	return "면접을 시작해주세요. 지원자에게 인사하고 문제를 읽은 후 접근 방식을 물어보세요.";
}

export function getUserMessagePrompt(
	content: string,
	codeContext: string,
): string {
	return `[현재 코드]
\`\`\`
${codeContext || "(아직 코드 없음)"}
\`\`\`

[지원자 답변]
${content}`;
}

export function getCodeAnalysisPrompt(
	previousCode: string,
	currentCode: string,
	pauseDuration: number,
): string {
	return `## 코드 변화 분석

[이전 코드]
\`\`\`
${previousCode || "(없음)"}
\`\`\`

[현재 코드]
\`\`\`
${currentCode}
\`\`\`

[마지막 변경 후 경과 시간]: ${pauseDuration}초

## 지시사항
코드 변화를 분석하고, 질문이 필요하면 질문하세요.
질문이 필요 없으면 정확히 "SKIP"이라고만 응답하세요.

### 질문이 적절한 상황
- 새로운 자료구조나 알고리즘 사용 (예: Map, Set, 재귀, DP)
- 8초 이상 멈춤 (막힌 것 같음)
- 코드를 많이 삭제함 (방향 전환)
- 중요한 로직 작성 완료

### 질문이 불필요한 상황
- 단순 변수명 변경이나 들여쓰기 수정
- 아직 코드 작성 중 (짧은 추가)
- 이미 최근에 질문한 부분`;
}

export function getReportPrompt(
	problemInfo: ProblemInfo,
	messages: ChatMessage[],
	finalCode: string,
	duration: number,
): string {
	const conversationLog = messages
		.filter((m) => m.role !== "system")
		.map(
			(m) =>
				`[${m.role === "interviewer" ? "면접관" : "지원자"}]: ${m.content}`,
		)
		.join("\n");

	return `## 면접 리포트 생성

### 문제 정보
- 제목: ${problemInfo.title}
- 난이도: Level ${problemInfo.level}

### 대화 내역
${conversationLog}

### 최종 코드
\`\`\`
${finalCode || "(코드 없음)"}
\`\`\`

### 소요 시간
${Math.floor(duration / 60)}분 ${duration % 60}초

## 지시사항
다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):

{
  "scores": {
    "understanding": 0-100,
    "communication": 0-100,
    "codeQuality": 0-100,
    "timeManagement": 0-100
  },
  "feedback": ["전체적인 피드백 1", "피드백 2"],
  "strengths": ["잘한 점 1", "잘한 점 2"],
  "improvements": ["개선점 1", "개선점 2"]
}

### 평가 기준
- understanding: 문제 이해도, 요구사항 파악
- communication: 설명 명확성, 질문 대응, 사고 과정 표현
- codeQuality: 코드 정확성, 가독성, 효율성
- timeManagement: 시간 내 진행, 우선순위 판단`;
}

export function formatMessagesForAI(
	messages: ChatMessage[],
): { role: string; content: string }[] {
	return messages
		.filter((m) => m.role !== "system")
		.map((m) => ({
			role: m.role === "interviewer" ? "assistant" : "user",
			content: m.content,
		}));
}
