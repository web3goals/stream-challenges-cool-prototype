import {
  Avatar,
  Box,
  Divider,
  Link as MuiLink,
  SxProps,
  Typography,
} from "@mui/material";
import { CardBox, FullWidthSkeleton } from "components/styled";
import CrossbellCharacterEntity from "entities/CrossbellCharacterEntity";
import useError from "hooks/useError";
import { useEffect, useState } from "react";
import { palette } from "theme/palette";
import { emojiAvatarForAddress } from "utils/avatars";
import { addressToShortAddress, ipfsUriToHttpUri } from "utils/converters";
import { getCrossbellCharacterById } from "utils/crossbell";

/**
 * A component with a streamer card.
 */
export default function CrossbellStreamerCard(props: {
  characterId: number;
  successfulStreams: number;
  sx?: SxProps;
}) {
  const { handleError } = useError();
  const [character, setCharacter] = useState<
    CrossbellCharacterEntity | null | undefined
  >();

  useEffect(() => {
    getCrossbellCharacterById(props.characterId)
      .then((character) => setCharacter(character))
      .catch((error) => handleError(error, true));
  }, [props.characterId]);

  if (!character) {
    return <FullWidthSkeleton />;
  }

  return (
    <CardBox sx={{ display: "flex", flexDirection: "row", ...props.sx }}>
      {/* Left part */}
      <Box>
        <Avatar
          sx={{
            width: 64,
            height: 64,
            borderRadius: 64,
            background: emojiAvatarForAddress(character.owner).color,
            ...props.sx,
          }}
          src={
            character?.avatar
              ? ipfsUriToHttpUri(character.avatar, "https://crossbell.io/ipfs/")
              : undefined
          }
        >
          <Typography fontSize={28}>
            {emojiAvatarForAddress(character.owner).emoji}
          </Typography>
        </Avatar>
      </Box>
      {/* Right part */}
      <Box width={1} ml={1.5} display="flex" flexDirection="column">
        <Typography fontWeight={700} color={palette.green}>
          {props.successfulStreams} successful streams
        </Typography>
        <Divider sx={{ mt: 1, mb: 1 }} />
        <MuiLink
          href={`https://crossbell.io/@${character.handle}`}
          target="_blank"
          fontWeight={700}
          variant="body2"
          sx={{ ...props.sx }}
        >
          {character.name
            ? character.name +
              " (" +
              addressToShortAddress(character.owner) +
              ")"
            : addressToShortAddress(character.owner)}
        </MuiLink>
        {character.bio && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {character.bio}
          </Typography>
        )}
      </Box>
    </CardBox>
  );
}
