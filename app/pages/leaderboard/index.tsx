import { Box, Typography } from "@mui/material";
import EntityList from "components/entity/EntityList";
import Layout from "components/layout";
import CrossbellStreamerCard from "components/streamer/crossbell/CrossbellStreamerCard";
import StreamerCard from "components/streamer/StreamerCard";
import { challengeContractAbi } from "contracts/abi/challengeContract";
import CrossbellStreamerEntity from "entities/CrossbellStreamerEntity";
import useError from "hooks/useError";
import { useState, useEffect } from "react";
import {
  chainToSupportedChainChallengeContractAddress,
  chainToSupportedChainId,
} from "utils/chains";
import { getCrossbellChallengeStreamers } from "utils/crossbell";
import { useContractRead, useNetwork } from "wagmi";
import { crossbell } from "wagmi/chains";

/**
 * Page with the leaderboard
 */
export default function Leaderboard() {
  const { chain } = useNetwork();

  return (
    <Layout maxWidth="md">
      <Box display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" fontWeight={700} textAlign="center">
          🏆 Leaderboard
        </Typography>
        {chainToSupportedChainId(chain) === crossbell.id ? (
          <CrossbellLeaderboardStreamers />
        ) : (
          <LeaderboardStreamers />
        )}
      </Box>
    </Layout>
  );
}

function LeaderboardStreamers() {
  const { chain } = useNetwork();

  const { data: streamers } = useContractRead({
    address: chainToSupportedChainChallengeContractAddress(chain),
    abi: challengeContractAbi,
    functionName: "getStreamers",
  });

  return (
    <EntityList
      entities={
        streamers
          ? [...streamers].sort((s1, s2) =>
              s2.successfulStreams.sub(s1.successfulStreams).toNumber()
            )
          : undefined
      }
      renderEntityCard={(streamer, index) => (
        <StreamerCard
          key={index}
          accountAddress={streamer.accountAddress}
          successfulStreams={streamer.successfulStreams.toNumber()}
        />
      )}
      noEntitiesText="😐 no streamers"
      sx={{ mt: 2 }}
    />
  );
}

function CrossbellLeaderboardStreamers() {
  const { handleError } = useError();
  const [streamers, setStreamers] = useState<
    CrossbellStreamerEntity[] | undefined
  >();

  useEffect(() => {
    getCrossbellChallengeStreamers()
      .then((streamers) => setStreamers(streamers))
      .catch((error) => handleError(error, true));
  }, []);

  return (
    <EntityList
      entities={
        streamers
          ? [...streamers].sort(
              (s1, s2) => s2.successfulStreams - s1.successfulStreams
            )
          : undefined
      }
      renderEntityCard={(streamer, index) => (
        <CrossbellStreamerCard
          key={index}
          characterId={streamer.characterId}
          successfulStreams={streamer.successfulStreams}
        />
      )}
      noEntitiesText="😐 no streamers"
      sx={{ mt: 2 }}
    />
  );
}
