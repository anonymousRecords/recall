import { MemoryRouter } from "react-router";
import { AppRouter } from "./Router";

export function App() {
	return (
		<MemoryRouter initialEntries={["/"]}>
			<AppRouter />
		</MemoryRouter>
	);
}
