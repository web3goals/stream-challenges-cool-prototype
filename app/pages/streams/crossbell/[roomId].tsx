import { useLobby, useRoom } from "@huddle01/react/hooks";
import Layout from "components/layout";
import CrossbellStreamFinishDialog from "components/stream/crossbell/CrossbellStreamFinishDialog";
import StreamLobby from "components/stream/StreamLobby";
import StreamRoom from "components/stream/StreamRoom";
import { FullWidthSkeleton } from "components/styled";
import { DialogContext } from "context/dialog";
import CrossbellStreamEntity from "entities/CrossbellStreamEntity";
import useError from "hooks/useError";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { getLastCrossbellChallengeStreamById } from "utils/crossbell";

/**
 * Page with a crossbell stream.
 */
export default function CrossbellStream() {
  const router = useRouter();
  const { roomId } = router.query;
  const { closeDialog } = useContext(DialogContext);
  const { handleError } = useError();
  const { joinLobby, isLobbyJoined } = useLobby();
  const { isRoomJoined } = useRoom();
  const [stream, setStream] = useState<
    CrossbellStreamEntity | null | undefined
  >();

  // Join lobby when stream data is loaded.
  useEffect(() => {
    if (roomId && stream && joinLobby.isCallable) {
      joinLobby(roomId.toString());
    }
  }, [roomId, stream, joinLobby]);

  // Load crossbell stream by id
  useEffect(() => {
    getLastCrossbellChallengeStreamById(roomId?.toString())
      .then((stream) => setStream(stream))
      .catch((error) => handleError(error, true));
  }, [roomId]);

  return (
    <Layout maxWidth="md">
      {isRoomJoined ? (
        <StreamRoom
          id={stream?.id}
          authorAddress={stream?.authorAddress}
          description={stream?.description}
          finishDialog={
            <CrossbellStreamFinishDialog
              stream={stream!}
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
