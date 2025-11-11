/**
 * Mock data helpers for local walkthroughs and tutorials.
 * These utilities keep beginners productive even without network
 * connectivity or funded wallets.
 */

export type MockStarWarsCharacter = {
    name: string;
    height: number;
    mass: number;
    numberOfMovies: number;
    apiUid: number;
};

export type MockWeatherReading = {
    locationId: string;
    temperatureC: number;
    humidity: number;
    recordedAt: string;
};

export type MockWeb2JsonBundle = {
    request: {
        url: string;
        httpMethod: string;
        headers: string;
        queryParams: string;
        body: string;
        postProcessJq: string;
        abiSignature: string;
    };
    abiEncodedRequest: string;
    roundId: number;
    proof: {
        response_hex: string;
        attestation_type: string;
        proof: string[];
    };
    decodedResponse: MockStarWarsCharacter;
};

const DEFAULT_CHARACTER: MockStarWarsCharacter = {
    name: "R2-D2",
    height: 96,
    mass: 32,
    numberOfMovies: 6,
    apiUid: 3,
};

const DEFAULT_WEATHER_READING: MockWeatherReading = {
    locationId: "CITY-123",
    temperatureC: 12.3,
    humidity: 72,
    recordedAt: new Date().toISOString(),
};

export const mockStarWarsCharacters: MockStarWarsCharacter[] = [
    DEFAULT_CHARACTER,
    {
        name: "Luke Skywalker",
        height: 172,
        mass: 77,
        numberOfMovies: 5,
        apiUid: 1,
    },
    {
        name: "Leia Organa",
        height: 150,
        mass: 49,
        numberOfMovies: 5,
        apiUid: 5,
    },
];

export const mockWeatherReadings: MockWeatherReading[] = [
    DEFAULT_WEATHER_READING,
    {
        locationId: "CITY-456",
        temperatureC: 29.4,
        humidity: 61,
        recordedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
        locationId: "CITY-789",
        temperatureC: -3.1,
        humidity: 88,
        recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
];

/**
 * Generates a reusable mock bundle that mirrors the real attestation
 * structures used by the Web2Json scripts. Use this for dry runs,
 * tutorials, or tests that should not rely on the live verifier.
 */
export function buildMockWeb2JsonBundle(
    character: MockStarWarsCharacter = DEFAULT_CHARACTER,
    roundId: number = 1_000_000,
    overrides?: Partial<MockWeb2JsonBundle>
): MockWeb2JsonBundle {
    const base: MockWeb2JsonBundle = {
        request: {
            url: "https://swapi.info/api/people/3",
            httpMethod: "GET",
            headers: "{}",
            queryParams: "{}",
            body: "{}",
            postProcessJq:
                "{name: .name, height: .height, mass: .mass, numberOfFilms: .films | length, uid: (.url | split(\"/\") | .[-1] | tonumber)}",
            abiSignature:
                '{"components":[{"internalType":"string","name":"name","type":"string"},{"internalType":"uint256","name":"height","type":"uint256"},{"internalType":"uint256","name":"mass","type":"uint256"},{"internalType":"uint256","name":"numberOfFilms","type":"uint256"},{"internalType":"uint256","name":"uid","type":"uint256"}],"name":"task","type":"tuple"}',
        },
        abiEncodedRequest:
            "0x576562324a736f6e0000000000000000000000000000000000000000000000007573652d6d6f636b2d72657175657374000000000000000000000000000000",
        roundId,
        proof: {
            response_hex: "0xmocked-response-hex",
            attestation_type:
                "0x576562324a736f6e000000000000000000000000000000000000000000000000",
            proof: [
                "0x1111111111111111111111111111111111111111111111111111111111111111",
                "0x2222222222222222222222222222222222222222222222222222222222222222",
                "0x3333333333333333333333333333333333333333333333333333333333333333",
            ],
        },
        decodedResponse: character,
    };

    if (!overrides) {
        return base;
    }

    return {
        ...base,
        ...overrides,
        request: {
            ...base.request,
            ...(overrides.request ?? {}),
        },
        proof: {
            ...base.proof,
            ...(overrides.proof ?? {}),
        },
    };
}

/**
 * Returns a weather reading by ID or a default placeholder.
 */
export function getMockWeatherReading(locationId?: string): MockWeatherReading {
    if (!locationId) {
        return DEFAULT_WEATHER_READING;
    }
    const match = mockWeatherReadings.find((reading) => reading.locationId === locationId);
    return match ?? {
        locationId,
        temperatureC: DEFAULT_WEATHER_READING.temperatureC,
        humidity: DEFAULT_WEATHER_READING.humidity,
        recordedAt: new Date().toISOString(),
    };

