import { BrowserRouter } from "react-router";
import { AppRouter } from "./Router";

export function App() {
	return (
		<BrowserRouter>
			<AppRouter />
		</BrowserRouter>
	);
}
