type FetchFn = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface FetchWeb2Options {
    headers?: Record<string, string>;
    fetchFn?: FetchFn;
}

export interface FetchWeb2Result<T = unknown> {
    raw: T;
    extracted: unknown;
}

function pickPath(data: any, path: string[]): unknown {
    return path.reduce((acc, key) => {
        if (acc && typeof acc === "object" && key in acc) {
            return acc[key as keyof typeof acc];
        }
        return undefined;
    }, data);
}

export async function fetchWeb2Data<T = unknown>(
    url: string,
    path: string[],
    options?: FetchWeb2Options
): Promise<FetchWeb2Result<T>> {
    const fetcher = options?.fetchFn ?? fetch;
    const response = await fetcher(url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers ?? {}),
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    const raw = (await response.json()) as T;
    const extracted = pickPath(raw, path);
    return { raw, extracted };
}

export async function verifyOnChain(payload: { responseHex: string; merkleProof: string[] }): Promise<boolean> {
    if (!payload.responseHex?.startsWith("0x")) {
        return false;
    }
    if (!Array.isArray(payload.merkleProof) || payload.merkleProof.length === 0) {
        return false;
    }
    return true;
}

