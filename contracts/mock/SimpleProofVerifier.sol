// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

/**
 * @title SimpleProofVerifier
 * @notice Minimal contract used in offline/mock flows to validate example proofs.
 *         It only checks that the provided payload hashes to a preconfigured value
 *         and that a (non-empty) merkle proof array is supplied.
 */
contract SimpleProofVerifier {
    bytes32 public immutable expectedHash;

    event ProofVerified(address indexed caller, bool success);

    constructor(bytes32 _expectedHash) {
        expectedHash = _expectedHash;
    }

    function verify(bytes calldata response, bytes32[] calldata merkleProof) external view returns (bool) {
        if (merkleProof.length == 0) {
            return false;
        }
        return keccak256(response) == expectedHash;
    }
}

