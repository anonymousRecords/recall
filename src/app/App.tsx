import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { MemoryRouter } from "react-router";
import { AppRouter } from "./Router";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 30, // 30초
		},
	},
});

export function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<ReactQueryDevtools initialIsOpen={false} />

			<MemoryRouter initialEntries={["/"]}>
				<AppRouter />
			</MemoryRouter>
		</QueryClientProvider>
	);
}
