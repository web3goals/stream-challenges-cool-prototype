import { useRecorder } from "@huddle01/react/app-utils";
import { Audio, Video } from "@huddle01/react/components";
import { usePeers, useRecording, useVideo } from "@huddle01/react/hooks";
import { Box, Stack, Typography } from "@mui/material";
import { LargeLoadingButton } from "components/styled";
import { DialogContext } from "context/dialog";
import { useRouter } from "next/router";
import { useContext, useEffect, useRef } from "react";
import { isAddressesEqual } from "utils/addresses";
import { useAccount } from "wagmi";
import CrossbellStreamFinishDialog from "./crossbell/CrossbellStreamFinishDialog";
import StreamFinishDialog from "./StreamFinishDialog";

/**
 * A component with a stream room.
 */
export default function StreamRoom(props: {
  id?: string;
  description?: string;
  authorAddress?: string;
  isCrossbell?: boolean;
}) {
  const { showDialog, closeDialog } = useContext(DialogContext);
  const { address } = useAccount();
  const { push } = useRouter();
  const { produceVideo, stopProducingVideo, stream: videoStream } = useVideo();
  const { peers } = usePeers();
  const {
    startRecording,
    stopRecording,
    error: recordingError,
    data: recordingData,
  } = useRecording();
  const videoStreamRef = useRef<HTMLVideoElement>(null);

  useRecorder(
    props.id || "",
    process.env.NEXT_PUBLIC_HUDDLE01_PROJECT_ID || ""
  );

  useEffect(() => {
    if (videoStream && videoStreamRef.current) {
      videoStreamRef.current.srcObject = videoStream;
    }
  }, [videoStreamRef, videoStream]);

  // Open link with recording in new tab
  useEffect(() => {
    if ((recordingData as any)?.s3URL) {
      window.open((recordingData as any).s3URL);
    }
  }, [recordingData]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        👀 Stream - {props.description}
      </Typography>
      {/* Actions */}
      <Stack spacing={2} mt={2} minWidth={320}>
        <LargeLoadingButton
          variant="outlined"
          disabled={!produceVideo.isCallable && !stopProducingVideo.isCallable}
          onClick={() => {
            if (produceVideo.isCallable) {
              produceVideo(videoStream);
            } else if (stopProducingVideo.isCallable) {
              stopProducingVideo();
            }
          }}
        >
          {produceVideo.isCallable
            ? "Produce camera"
            : stopProducingVideo.isCallable
            ? "Stop producing camera"
            : "Loading camera..."}
        </LargeLoadingButton>
        {isAddressesEqual(address, props.authorAddress) && (
          <LargeLoadingButton
            variant="outlined"
            disabled={!startRecording.isCallable}
            onClick={() => {
              startRecording(
                `https://${window.location.host}/streams/rec/${props.id}`
              );
            }}
          >
            Start recording
          </LargeLoadingButton>
        )}
        {isAddressesEqual(address, props.authorAddress) && (
          <LargeLoadingButton
            variant="outlined"
            disabled={!stopRecording.isCallable}
            onClick={() => stopRecording()}
          >
            Stop recording
          </LargeLoadingButton>
        )}
        {isAddressesEqual(address, props.authorAddress) && (
          <LargeLoadingButton
            variant="contained"
            onClick={() =>
              props.isCrossbell
                ? showDialog?.(
                    <CrossbellStreamFinishDialog
                      onSuccess={() => push("/leaderboard")}
                      onClose={closeDialog}
                    />
                  )
                : showDialog?.(
                    <StreamFinishDialog
                      onSuccess={() => push("/leaderboard")}
                      onClose={closeDialog}
                    />
                  )
            }
          >
            Finish stream
          </LargeLoadingButton>
        )}
      </Stack>
      {/* Video stream */}
      {videoStream?.active && (
        <Box mt={4}>
          <video
            ref={videoStreamRef}
            autoPlay
            muted
            style={{ width: "360px", borderRadius: "24px" }}
          />
        </Box>
      )}
      {/* Peers */}
      <Box mt={4}>
        {Object.values(peers)
          .filter((peer) => peer.cam)
          .map((peer) => (
            <Video
              key={peer.peerId}
              peerId={peer.peerId}
              track={peer.cam}
              style={{ width: "180px", borderRadius: "24px" }}
            />
          ))}
        {Object.values(peers)
          .filter((peer) => peer.mic)
          .map((peer) => (
            <Audio key={peer.peerId} peerId={peer.peerId} track={peer.mic} />
          ))}
      </Box>
    </Box>
  );
}
