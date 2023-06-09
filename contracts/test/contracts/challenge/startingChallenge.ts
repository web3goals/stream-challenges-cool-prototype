import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { SECONDS_PER_MINUTE } from "../../helpers/constants";
import { ERRORS } from "../../helpers/errors";
import { EVENTS } from "../../helpers/events";
import { challengeContract, makeSuiteCleanRoom, userOne } from "../../setup";

makeSuiteCleanRoom("Challenge Starting", function () {
  it("Users should be able to start a challenge twice", async function () {
    // Try one
    await expect(challengeContract.connect(userOne).startChallenge()).to.emit(
      challengeContract,
      EVENTS.challengeStarted
    );
    // Try two
    await expect(
      challengeContract.connect(userOne).startChallenge()
    ).to.be.revertedWith(ERRORS.lastChallengeNotFinished);
    await time.increase(30 * SECONDS_PER_MINUTE);
    // Try three after increasing time
    await expect(challengeContract.connect(userOne).startChallenge()).to.emit(
      challengeContract,
      EVENTS.challengeStarted
    );
  });
});
