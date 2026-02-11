import React from "react";
import ReactDOM from "react-dom/client";
import { AnalyticsPage } from "../../src/pages/Analytics/AnalyticsPage";
import "../sidepanel/style.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<AnalyticsPage />
	</React.StrictMode>,
);
