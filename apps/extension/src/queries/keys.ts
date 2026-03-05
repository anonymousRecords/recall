export const queryKeys = {
	problems: {
		all: ["problems"] as const,
		lists: () => [...queryKeys.problems.all, "list"] as const,
		todayReviews: () => [...queryKeys.problems.all, "todayReviews"] as const,
		detail: (id: string) => [...queryKeys.problems.all, "detail", id] as const,
	},
	interviews: {
		all: ["interviews"] as const,
		completed: () => [...queryKeys.interviews.all, "completed"] as const,
	},
	settings: {
		all: ["settings"] as const,
	},
	liveCodingSettings: {
		all: ["liveCodingSettings"] as const,
	},
} as const;
