import { expect } from "chai";
import { fetchWeb2Data, verifyOnChain } from "../utils/simpleFdc";

describe("simpleFdc utilities", () => {
    it("extracts nested values from fetched JSON", async () => {
        const fakeFetch = async () =>
            new Response(JSON.stringify({ name: { first: "Luke", last: "Skywalker" } }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });

        const result = await fetchWeb2Data("https://example.com", ["name", "first"], { fetchFn: fakeFetch });
        expect(result.raw).to.have.property("name");
        expect(result.extracted).to.equal("Luke");
    });

    it("throws when fetch response is not ok", async () => {
        const fakeFetch = async () =>
            new Response("Server error", {
                status: 500,
                headers: { "Content-Type": "text/plain" },
            });

        await expect(fetchWeb2Data("https://example.com", ["foo"], { fetchFn: fakeFetch })).to.be.rejectedWith(
            "Failed to fetch data"
        );
    });

    it("verifies proof structure", async () => {
        const isValid = await verifyOnChain({
            responseHex: "0x1234",
            merkleProof: ["0xaaa", "0xbbb"],
        });
        expect(isValid).to.be.true;
    });

    it("rejects invalid proof inputs", async () => {
        const isValid = await verifyOnChain({
            responseHex: "not-hex",
            merkleProof: [],
        });
        expect(isValid).to.be.false;
    });
});

