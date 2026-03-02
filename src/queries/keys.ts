export const queryKeys = {
	problems: {
		all: ["problems"] as const,
		lists: () => [...queryKeys.problems.all, "list"] as const,
		todayReviews: () => [...queryKeys.problems.all, "todayReviews"] as const,
		detail: (id: string) => [...queryKeys.problems.all, "detail", id] as const,
	},
	sessions: {
		all: ["sessions"] as const,
		completed: () => [...queryKeys.sessions.all, "completed"] as const,
	},
	settings: {
		all: ["settings"] as const,
	},
	liveCodingSettings: {
		all: ["liveCodingSettings"] as const,
	},
} as const;
