import Dexie, { type EntityTable } from "dexie";
import type {
	LiveCodingSettings,
	LiveInterview,
	Problem,
	Review,
	Settings,
} from "../../types";

const db = new Dexie("OdapNoteDB") as Dexie & {
	problems: EntityTable<Problem, "id">;
	reviews: EntityTable<Review, "id">;
	settings: EntityTable<Settings, "id">;
	liveInterviews: EntityTable<LiveInterview, "id">;
	liveCodingSettings: EntityTable<LiveCodingSettings, "id">;
};

db.version(1).stores({
	problems: "id, nextReviewDate, site, status, createdAt",
	reviews: "id, problemId, completedAt",
	settings: "id",
	liveSessions: "id, status, startedAt",
	liveCodingSettings: "id",
});

db.version(2).stores({
	liveSessions: null,
	liveInterviews: "id, status, startedAt",
});

export { db };
