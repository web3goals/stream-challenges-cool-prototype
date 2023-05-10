import { useLobby, useRoom } from "@huddle01/react/hooks";
import Layout from "components/layout";
import StreamFinishDialog from "components/stream/StreamFinishDialog";
import StreamLobby from "components/stream/StreamLobby";
import StreamRoom from "components/stream/StreamRoom";
import { FullWidthSkeleton } from "components/styled";
import { DialogContext } from "context/dialog";
import { challengeContractAbi } from "contracts/abi/challengeContract";
import { ethers } from "ethers";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import { chainToSupportedChainChallengeContractAddress } from "utils/chains";
import { stringToAddress } from "utils/converters";
import { useContractRead, useNetwork } from "wagmi";

/**
 * Page with a stream.
 */
export default function Stream() {
  const router = useRouter();
  const { authorAddress } = router.query;
  const { closeDialog } = useContext(DialogContext);
  const { chain } = useNetwork();
  const { joinLobby, isLobbyJoined } = useLobby();
  const { isRoomJoined } = useRoom();

  const { data: stream } = useContractRead({
    address: chainToSupportedChainChallengeContractAddress(chain),
    abi: challengeContractAbi,
    functionName: "getLastChallengeStreamByAuthorAddress",
    args: [
      stringToAddress(authorAddress?.toString()) ||
        ethers.constants.AddressZero,
    ],
  });

  // Join lobby when stream data is loaded.
  useEffect(() => {
    if (stream && joinLobby.isCallable) {
      joinLobby(stream.identifier);
    }
  }, [stream, joinLobby]);

  return (
    <Layout maxWidth="md">
      {isRoomJoined ? (
        <StreamRoom
          id={stream?.identifier}
          authorAddress={stream?.authorAddress}
          description={stream?.description}
          finishDialog={
            <StreamFinishDialog
              onSuccess={() => router.push("/leaderboard")}
              onClose={closeDialog}
            />
          }
        />
      ) : isLobbyJoined ? (
        <StreamLobby />
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}
