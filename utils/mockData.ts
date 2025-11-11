export const mockCharacter = {
    name: "Luke Skywalker",
    height: 172,
    mass: 77,
    films: 4,
    uid: 1,
};

export const mockProof = {
    responseHex: "0x4c756b6520536b7977616c6b6572", // "Luke Skywalker" in hex
    merkleProof: ["0xaaaabbbbccccddddeeeeffff0000111122223333444455556666777788889999"],
};

export const mockRequest = {
    url: "https://swapi.dev/api/people/1/",
    httpMethod: "GET",
    headers: "{}",
    queryParams: "{}",
    body: "{}",
    postProcessJq: `{name: .name, height: .height, mass: .mass, numberOfFilms: .films | length}`,
};

