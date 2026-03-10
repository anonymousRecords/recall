import { z } from "zod";

export const InterviewReportSchema = z.object({
	scores: z.object({
		understanding: z.number(),
		communication: z.number(),
		codeQuality: z.number(),
		timeManagement: z.number(),
	}),
	feedback: z.array(z.string()),
	strengths: z.array(z.string()),
	improvements: z.array(z.string()),
	supportingQuotes: z
		.array(z.object({ quote: z.string(), analysis: z.string() }))
		.optional(),
	sampleAnswer: z.string().optional(),
});

export type InterviewReportAIResponse = z.infer<typeof InterviewReportSchema>;

export const INTERVIEW_REPORT_JSON_SCHEMA = {
	type: "object",
	properties: {
		scores: {
			type: "object",
			properties: {
				understanding: { type: "number" },
				communication: { type: "number" },
				codeQuality: { type: "number" },
				timeManagement: { type: "number" },
			},
			required: [
				"understanding",
				"communication",
				"codeQuality",
				"timeManagement",
			],
		},
		feedback: { type: "array", items: { type: "string" } },
		strengths: { type: "array", items: { type: "string" } },
		improvements: { type: "array", items: { type: "string" } },
		supportingQuotes: {
			type: "array",
			items: {
				type: "object",
				properties: {
					quote: { type: "string" },
					analysis: { type: "string" },
				},
				required: ["quote", "analysis"],
			},
		},
		sampleAnswer: { type: "string" },
	},
	required: ["scores", "feedback", "strengths", "improvements"],
} as const;
