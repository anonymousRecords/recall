import { useCallback, useEffect, useState } from "react";

interface UseAsyncDataResult<T> {
	data: T;
	loading: boolean;
	error: Error | null;
	refetch: () => Promise<void>;
	setData: React.Dispatch<React.SetStateAction<T>>;
}

export function useAsyncData<T>(
	fetcher: () => Promise<T>,
	initialData: T,
): UseAsyncDataResult<T> {
	const [data, setData] = useState<T>(initialData);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);

	const refetch = useCallback(async () => {
		try {
			setLoading(true);
			const result = await fetcher();
			setData(result);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Failed to fetch data"));
		} finally {
			setLoading(false);
		}
	}, [fetcher]);

	useEffect(() => {
		refetch();
	}, [refetch]);

	return { data, loading, error, refetch, setData };
}
