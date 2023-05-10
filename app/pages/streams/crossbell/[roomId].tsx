import { useLobby, useRoom } from "@huddle01/react/hooks";
import Layout from "components/layout";
import StreamLobby from "components/stream/StreamLobby";
import StreamRoom from "components/stream/StreamRoom";
import { FullWidthSkeleton } from "components/styled";
import CrossbellStreamEntity from "entities/CrossbellStreamEntity";
import useError from "hooks/useError";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getLastCrossbellChallengeStreamById } from "utils/crossbell";

/**
 * Page with a crossbell stream.
 */
export default function CrossbellStream() {
  const router = useRouter();
  const { roomId } = router.query;
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
          authorAddress={stream?.author}
          description={stream?.description}
          isCrossbell={true}
        />
      ) : isLobbyJoined ? (
        <StreamLobby />
      ) : (
        <FullWidthSkeleton />
      )}
    </Layout>
  );
}
