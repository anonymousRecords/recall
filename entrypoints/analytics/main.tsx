import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { AnalyticsPage } from "../../src/pages/Analytics/AnalyticsPage";
import "../sidepanel/style.css";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 30,
		},
	},
});

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<QueryClientProvider client={queryClient}>
			<AnalyticsPage />
		</QueryClientProvider>
	</React.StrictMode>,
);
