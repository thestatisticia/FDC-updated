// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

import {ContractRegistry} from "@flarenetwork/flare-periphery-contracts/coston2/ContractRegistry.sol";
import {IWeb2Json} from "@flarenetwork/flare-periphery-contracts/coston2/IWeb2Json.sol";

/// @title StarterCounter
/// @notice Minimal template that shows how to wire an attested Web2Json payload
///         to application logic. Swap the decode line with your own struct once
///         you control the verifier request.
contract StarterCounter {
    uint256 public counter;

    event CounterIncremented(uint256 newValue, uint256 addedAmount);
    event CounterReset(address indexed caller);

    /// @notice Increments the counter using attested data.
    /// @dev The proof is verified before any state updates. By default we assume the
    ///      response body encodes a single uint256 (e.g. an increment value). Replace
    ///      the `abi.decode` target type with your DTO when customising.
    function incrementWithProof(IWeb2Json.Proof calldata proof) external {
        require(_isJsonApiProofValid(proof), "StarterCounter: invalid proof");

        uint256 incrementAmount = abi.decode(proof.data.responseBody.abiEncodedData, (uint256));
        counter += incrementAmount;
        emit CounterIncremented(counter, incrementAmount);
    }

    /// @notice Resets the counter to zero. Restrict or extend this as needed.
    function resetCounter() external {
        counter = 0;
        emit CounterReset(msg.sender);
    }

    /// @notice Handy view that computes what the next counter value would be for a given proof.
    function previewNextValue(IWeb2Json.Proof calldata proof) external view returns (uint256) {
        if (!_isJsonApiProofValid(proof)) {
            return counter;
        }
        uint256 incrementAmount = abi.decode(proof.data.responseBody.abiEncodedData, (uint256));
        return counter + incrementAmount;
    }

    function _isJsonApiProofValid(IWeb2Json.Proof calldata proof) private view returns (bool) {
        return ContractRegistry.getFdcVerification().verifyJsonApi(proof);
    }
}



