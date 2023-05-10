import axios from "axios";
import { CROSSBELL } from "constants/crossbell";
import CrossbellChallengeEntity from "entities/CrossbellChallengeEntity";
import CrossbellStreamEntity from "entities/CrossbellStreamEntity";

export async function getLastCrossbellChallenge(): Promise<CrossbellChallengeEntity | null> {
  const response = await axios.get(
    `https://indexer.crossbell.io/v1/characters/${CROSSBELL.challengeAuthorCharacterId}/notes`
  );
  for (const note of response.data.list) {
    if (note.metadata.content.content === "Challenge is started!") {
      const noteCreatedAtTimestamp = new Date(note.createdAt).valueOf();
      return {
        id: note.noteId,
        startedTimestamp: noteCreatedAtTimestamp,
        isActive:
          new Date().valueOf() - noteCreatedAtTimestamp <
          CROSSBELL.challengeDurationMs,
      };
    }
  }
  return null;
}

export async function getLastCrossbellChallengeStreamById(
  id: string | undefined
): Promise<CrossbellStreamEntity | null> {
  if (!id) {
    return null;
  }
  const lastChallenge = await getLastCrossbellChallenge();
  if (!lastChallenge) {
    return null;
  }
  const response = await axios.get(
    `https://indexer.crossbell.io/v1/notes?toCharacterId=${CROSSBELL.challengeAuthorCharacterId}&toNoteId=${lastChallenge.id}`
  );
  for (const note of response.data.list) {
    if (note.metadata.content.content.includes(id)) {
      return {
        id: id,
        author: note.owner,
        description: note.metadata.content.content.match(/"(.*?)"/)[1],
      };
    }
  }
  return null;
}

export async function getPrimaryCrossbellCharacterIdByAddress(
  address: string | undefined
): Promise<number | null> {
  if (!address) {
    return null;
  }
  const response = await axios.get(
    `https://indexer.crossbell.io/v1/addresses/${address}/characters`
  );
  for (const character of response.data.list) {
    if (character.primary === true) {
      return character.characterId;
    }
  }
  return null;
}
