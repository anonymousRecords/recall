import { Route, Routes } from "react-router";
import { Layout } from "../components/layout";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { LiveCodingPage } from "../pages/LiveCoding";
import { ProblemDetailPage, ProblemsPage } from "../pages/Problems";
import { SettingsPage } from "../pages/Settings";

export function AppRouter() {
	return (
		<Layout>
			<Routes>
				<Route path="/" element={<DashboardPage />} />
				<Route path="/problems" element={<ProblemsPage />} />
				<Route path="/problems/new" element={<ProblemDetailPage />} />
				<Route path="/problems/:id" element={<ProblemDetailPage />} />
				<Route path="/live" element={<LiveCodingPage />} />
				<Route path="/settings" element={<SettingsPage />} />
			</Routes>
		</Layout>
	);
}
