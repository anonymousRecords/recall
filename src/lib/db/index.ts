import Dexie, { type EntityTable } from "dexie";
import type { Problem, Review, Settings } from "@/types";

const db = new Dexie("OdapNoteDB") as Dexie & {
	problems: EntityTable<Problem, "id">;
	reviews: EntityTable<Review, "id">;
	settings: EntityTable<Settings, "id">;
};

db.version(1).stores({
	problems: "id, nextReviewDate, site, status, createdAt",
	reviews: "id, problemId, completedAt",
	settings: "id",
});

export { db };
