<div align="center">
  <img width="450" height="450" alt="image" src="https://github.com/user-attachments/assets/061265a2-9c0b-4ee6-86ab-ad87cf2fe105" />
</div>

- [서비스 소개](https://github.com/anonymousRecords/recall?tab=readme-ov-file#%EC%84%9C%EB%B9%84%EC%8A%A4-%EC%86%8C%EA%B0%9C)
- [기획 배경](https://github.com/anonymousRecords/recall?tab=readme-ov-file#%EA%B8%B0%ED%9A%8D-%EB%B0%B0%EA%B2%BD)
- [기술 스택](https://github.com/anonymousRecords/recall?tab=readme-ov-file#%EA%B8%B0%EC%88%A0-%EC%8A%A4%ED%83%9D)
- [핵심 기능](https://github.com/anonymousRecords/recall?tab=readme-ov-file#%ED%95%B5%EC%8B%AC-%EA%B8%B0%EB%8A%A5)
- [개발 기록](https://github.com/anonymousRecords/recall?tab=readme-ov-file#%EA%B0%9C%EB%B0%9C-%EA%B8%B0%EB%A1%9D)

# Recall

### 서비스 소개
코테 풀 줄 알아도, 말하면서 푸는 건 다른 이야기!

코딩 테스트는 풀 수 있어도, 말하면서 푸는 연습은 혼자 하기 어렵습니다. **Recall**은 그 경험을 직접 겪어 만든 코딩 테스트 준비용 크롬 익스텐션입니다.

에빙하우스 망각곡선 기반으로 복습 시점을 자동 계산해 알고리즘 문제를 체화하고, AI 면접관과 말로
설명하며 푸는 라이브 코딩 테스트를 연습할 수 있습니다.

### 기획 배경

취준을 하면서 코딩 테스트가 가장 큰 벽이었습니다.

많은 분들이 "한 문제 30분 고민하고 답지 보라"고 하지만, 저는 그 방식이 잘 맞지 않았습니다. 빠르게 답지를 보더라도 에빙하우스 망각곡선 이론에 따라 반복 복습하는 게 저에게는 더 효과적이었습니다. 문제를 아는 것과, 나중에도 기억하는 것은 다른 얘기였으니까요.

그런데 복습보다 더 큰 문제가 있었습니다.

코테 스터디를 한 적이 있었는데, 스터디가 모의 면접 방식으로 진행되었습니다. 직접 경험해보니 "코테를 푸는 것"과 "말로 설명하면서 푸는 것"은 완전히 다른 능력이라는 걸 실감했습니다. 실제 기업 라이브 코딩 테스트는 후자를 요구하는데, 혼자서는 연습하는 데 명확한 한계가 있었습니다.

그래서 AI 면접관과 함께하는 라이브 코딩 연습 기능을 만들었습니다.

현재 소규모 스터디에서 실사용하며 피드백을 받고 개선 중입니다.

> 🔔 출시 알림 받기 → [구글폼 링크](https://forms.gle/NmFcPW7mqF36tpNC9)


### 기술 스택

| 분류 | 기술 |
|------|------|
| **Extension** | ![WXT](https://img.shields.io/badge/WXT-0.20-000000?logo=googlechrome&logoColor=white) |
| **Frontend** | ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white) ![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white) |
| **상태관리** | ![TanStack Query](https://img.shields.io/badge/TanStack_Query-5-FF4154?logo=reactquery&logoColor=white) |
| **스타일링** | ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white) |
| **로컬 DB** | ![Dexie](https://img.shields.io/badge/Dexie-IndexedDB-FF6B35) |
| **검증** | ![Zod](https://img.shields.io/badge/Zod-4-3E67B1?logo=zod&logoColor=white) |
| **AI** | ![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai&logoColor=white) ![Claude](https://img.shields.io/badge/Anthropic-Claude_Haiku-D4A574) |
| **모노레포** | ![pnpm](https://img.shields.io/badge/pnpm-9-F69220?logo=pnpm&logoColor=white) ![Turbo](https://img.shields.io/badge/Turbo-2-EF4444?logo=turborepo&logoColor=white) |
| **코드 품질** | ![Biome](https://img.shields.io/badge/Biome-2-60A5FA?logo=biome&logoColor=white) |
| **분석** | ![PostHog](https://img.shields.io/badge/PostHog-분석-000000?logo=posthog&logoColor=white) |

### 핵심 기능

#### 1. 에빙하우스 망각곡선 기반 복습 스케줄링

문제를 풀고 넘어가면 며칠 안에 잊어버립니다. Recall은 **1 → 3 → 7 → 14 → 30일** 간격으로 복습 시점을 자동 계산해, 오늘 풀어야 할 문제만 대시보드에 모아줍니다.

- 문제 등록 시 다음 복습일 자동 지정
- 복습 완료 시 다음 단계로 진행, 진행 상태 시각화
- 복습 주기 커스터마이징 가능

<p align="center">
  <img width="400" height="300" alt="복습 스케줄 대시보드" src="https://github.com/user-attachments/assets/ddad49af-c6fa-4cb1-8b32-09f96c4ff6b8" />
  <img width="400" height="300" alt="문제 등록 화면" src="https://github.com/user-attachments/assets/3e22ba1b-33aa-436a-8939-f7d8a28db8c8" />
</p>

#### 2. AI 모의 개발 면접

프로그래머스에서 문제를 열면 Recall이 문제 정보를 자동으로 감지합니다. AI 면접관에게 **말로 설명하면서 문제를 풀며** 실전 라이브 코딩 테스트를 시뮬레이션합니다.

- 면접관 스타일 선택: 친절 / 보통 / 압박
- 제한 시간 설정: 30분 / 45분 / 60분
- 종료 후 4개 항목 점수 + AI 피드백 제공 (문제 이해 · 소통 능력 · 코드 품질 · 시간 관리)
- AI 제공자 선택: OpenAI GPT-4o-mini / Claude Haiku

<p align="center">
  <img width="400" height="300" alt="AI 면접 진행 화면" src="https://github.com/user-attachments/assets/0582c7cc-fae5-4a2c-8a3b-1508d7a3ce2b" />
  <img width="400" height="300" alt="면접 결과 및 피드백" src="https://github.com/user-attachments/assets/ccafe54d-bbf6-4ded-9c4c-0f057fc7db37" />
</p>

#### 3. 면접 기록 및 AI 비용 추적

면접 이력을 쌓으면 내 성장 흐름과 AI 사용 비용을 한눈에 파악할 수 있습니다.

- 점수 추이 그래프로 실력 변화 확인
- 면접관 스타일별 · AI 프로바이더별 평균 점수 비교
- 세션당 토큰 소비량 및 누적 비용 추적 (`$0.0000` 단위)
- 기간 필터: 최근 10회 / 최근 30일 / 전체

<p align="center">
  <img width="400" height="300" alt="면접 기록 및 비용 추적" src="https://github.com/user-attachments/assets/e9da5a69-757b-4548-94a9-4334d16a63c7" />
</p>

### 개발 기록
 - [Tailwind v4 다크 모드가 동작하지 않았던 이유: 상태 문제가 아니라 빌드 타임 문제였다](https://chapdo.vercel.app/posts/tailwind-v4-%EB%8B%A4%ED%81%AC-%EB%AA%A8%EB%93%9C%EA%B0%80-%EB%8F%99%EC%9E%91%ED%95%98%EC%A7%80-%EC%95%8A%EC%95%98%EB%8D%98-%EC%9D%B4%EC%9C%A0-%EC%83%81%ED%83%9C-%EB%AC%B8%EC%A0%9C%EA%B0%80-%EC%95%84%EB%8B%88%EB%9D%BC-%EB%B9%8C%EB%93%9C-%ED%83%80%EC%9E%84-%EB%AC%B8%EC%A0%9C%EC%98%80%EB%8B%A4/)
  - [useAsyncData 훅 구현기: TanStack Query 없이 비동기 상태 관리 패턴 만들기](https://chapdo.vercel.app/posts/useasyncdata-%ED%9B%85-%EA%B5%AC%ED%98%84%EA%B8%B0-tanstack-query-%EC%97%86%EC%9D%B4-%EB%B9%84%EB%8F%99%EA%B8%B0-%EC%83%81%ED%83%9C-%EA%B4%80%EB%A6%AC-%ED%8C%A8%ED%84%B4-%EB%A7%8C%EB%93%A4%EA%B8%B0/)
  - [useState로 폼을 만들었는데, 왜 찝찝할까? - react-hook-form을 도입하지 않은 이유와 그 결과](https://chapdo.vercel.app/posts/usestate%EB%A1%9C-%ED%8F%BC%EC%9D%84-%EB%A7%8C%EB%93%A4%EC%97%88%EB%8A%94%EB%8D%B0-%EC%99%9C-%EC%B0%9D%EC%B0%9D%ED%95%A0%EA%B9%8C-react-hook-form%EC%9D%84-%EB%8F%84%EC%9E%85%ED%95%98%EC%A7%80-%EC%95%8A%EC%9D%80-%EC%9D%B4%EC%9C%A0%EC%99%80-%EA%B7%B8-%EA%B2%B0%EA%B3%BC/)
  - [말 많은 AI 면접관 입 다물게 만들기: 오픈소스 5개에서 찾은 프롬프트전략](https://chapdo.vercel.app/posts/%EB%A7%90-%EB%A7%8E%EC%9D%80-ai-%EB%A9%B4%EC%A0%91%EA%B4%80-%EC%9E%85-%EB%8B%A4%EB%AC%BC%EA%B2%8C-%EB%A7%8C%EB%93%A4%EA%B8%B0-%EC%98%A4%ED%94%88%EC%86%8C%EC%8A%A4-5%EA%B0%9C%EC%97%90%EC%84%9C-%EC%B0%BE%EC%9D%80-%ED%94%84%EB%A1%AC%ED%94%84%ED%8A%B8-%EC%A0%84%EB%9E%B5/)
  - [크롬 익스텐션에서 BrowserRouter가 작동하지 않는 이유](https://chapdo.vercel.app/posts/%ED%81%AC%EB%A1%AC-%EC%9D%B5%EC%8A%A4%ED%85%90%EC%85%98%EC%97%90%EC%84%9C-browserrouter%EA%B0%80-%EC%9E%91%EB%8F%99%ED%95%98%EC%A7%80-%EC%95%8A%EB%8A%94-%EC%9D%B4%EC%9C%A0/)
  - [Claude와 OpenAI, 같은 코드로 제어하기: 인터페이스 추상화 전략](https://chapdo.vercel.app/posts/claude%EC%99%80-openai-%EA%B0%99%EC%9D%80-%EC%BD%94%EB%93%9C%EB%A1%9C-%EC%A0%9C%EC%96%B4%ED%95%98%EA%B8%B0-%EC%9D%B8%ED%84%B0%ED%8E%98%EC%9D%B4%EC%8A%A4-%EC%B6%94%EC%83%81%ED%99%94-%EC%A0%84%EB%9E%B5/)
  - [SKIP 응답에도 돈은 나간다: AI 호출을 막는 클라이언트 게이트키퍼 구현기](https://chapdo.vercel.app/posts/skip-%EC%9D%91%EB%8B%B5%EC%97%90%EB%8F%84-%EB%8F%88%EC%9D%80-%EB%82%98%EA%B0%84%EB%8B%A4-ai-%ED%98%B8%EC%B6%9C%EC%9D%84-%EB%A7%89%EB%8A%94-%ED%81%B4%EB%9D%BC%EC%9D%B4%EC%96%B8%ED%8A%B8-%EA%B2%8C%EC%9D%B4%ED%8A%B8%ED%82%A4%ED%8D%BC-%EA%B5%AC%ED%98%84%EA%B8%B0/)
  - [크롬 익스텐션 하나였던 프로젝트를 Turborepo 모노레포로 옮긴 이야기](https://chapdo.vercel.app/posts/%ED%81%AC%EB%A1%AC-%EC%9D%B5%EC%8A%A4%ED%85%90%EC%85%98-%ED%95%98%EB%82%98%EC%98%80%EB%8D%98-%ED%94%84%EB%A1%9C%EC%A0%9D%ED%8A%B8%EB%A5%BC-turborepo-%EB%AA%A8%EB%85%B8%EB%A0%88%ED%8F%AC%EB%A1%9C-%EC%98%AE%EA%B8%B4-%EC%9D%B4%EC%95%BC%EA%B8%B0/)
