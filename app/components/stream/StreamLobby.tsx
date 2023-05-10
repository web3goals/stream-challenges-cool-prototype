import { useRoom, useVideo } from "@huddle01/react/hooks";
import { Box, Typography, Stack } from "@mui/material";
import { LargeLoadingButton } from "components/styled";
import { useRef, useEffect } from "react";

/**
 * A component with a stream lobby.
 */
export default function StreamLobby() {
  const { joinRoom } = useRoom();
  const { fetchVideoStream, stopVideoStream, stream: videoStream } = useVideo();
  const videoStreamRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoStream && videoStreamRef.current) {
      videoStreamRef.current.srcObject = videoStream;
    }
  }, [videoStreamRef, videoStream]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h4" fontWeight={700} textAlign="center">
        ⚙️ Config camera, microphone
      </Typography>
      <Typography color="text.secondary" textAlign="center" mt={1}>
        and join stream
      </Typography>
      {/* Actions */}
      <Stack spacing={2} mt={2} minWidth={280}>
        <LargeLoadingButton
          variant="contained"
          disabled={!joinRoom.isCallable}
          onClick={joinRoom}
        >
          Join
        </LargeLoadingButton>
        <LargeLoadingButton
          variant="outlined"
          disabled={!fetchVideoStream.isCallable && !stopVideoStream.isCallable}
          onClick={() => {
            if (fetchVideoStream.isCallable) {
              fetchVideoStream();
            } else if (stopVideoStream.isCallable) {
              stopVideoStream();
            }
          }}
        >
          {fetchVideoStream.isCallable
            ? "Enable camera"
            : stopVideoStream.isCallable
            ? "Disable camera"
            : "Loading camera..."}
        </LargeLoadingButton>
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
    </Box>
  );
}
