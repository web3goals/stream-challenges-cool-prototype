import axios from "axios";
import { CROSSBELL } from "constants/crossbell";
import CrossbellChallengeEntity from "entities/CrossbellChallengeEntity";
import CrossbellCharacterEntity from "entities/CrossbellCharacterEntity";
import CrossbellStreamEntity from "entities/CrossbellStreamEntity";
import CrossbellStreamerEntity from "entities/CrossbellStreamerEntity";

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
        challengeId: note.toNote.noteId,
        authorAddress: note.owner,
        authorCharacterId: note.characterId,
        description: note.metadata.content.content.match(/"(.*?)"/)[1],
      };
    }
  }
  return null;
}

export async function getCrossbellChallengeStreamers(): Promise<
  CrossbellStreamerEntity[]
> {
  // Load challenges
  const challenges: number[] = [];
  let response = await axios.get(
    `https://indexer.crossbell.io/v1/characters/${CROSSBELL.challengeAuthorCharacterId}/notes`
  );
  for (const note of response.data.list) {
    if (note.metadata.content.content === "Challenge is started!") {
      challenges.push(note.noteId);
    }
  }
  // Load all streamers by loading streamers from each challenge
  const allStreamers: CrossbellStreamerEntity[] = [];
  for (const challenge of challenges) {
    const challengeStreamers: Set<number> = new Set();
    response = await axios.get(
      `https://indexer.crossbell.io/v1/notes?toCharacterId=${CROSSBELL.challengeAuthorCharacterId}&toNoteId=${challenge}`
    );
    for (const note of response.data.list) {
      if (note.metadata.content.content.includes("I finished the stream")) {
        challengeStreamers.add(note.characterId);
      }
    }
    // Add challenge streamers to all streamers
    challengeStreamers.forEach((challengeStreamer) => {
      if (
        !allStreamers.find(
          (streamer) => streamer.characterId === challengeStreamer
        )
      ) {
        allStreamers.push({
          characterId: challengeStreamer,
          successfulStreams: 0,
        });
      }
      allStreamers[
        allStreamers.findIndex(
          (streamer) => streamer.characterId === challengeStreamer
        )
      ].successfulStreams++;
    });
  }
  return allStreamers;
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

export async function getCrossbellCharacterById(
  id: number | undefined
): Promise<CrossbellCharacterEntity | null> {
  if (!id) {
    return null;
  }
  const response = await axios.get(
    `https://indexer.crossbell.io/v1/characters/${id}`
  );
  return {
    id: response.data.characterId,
    handle: response.data.handle,
    owner: response.data.owner,
    name: response.data.metadata.content.name,
    avatar: response.data.metadata.content.avatars?.[0] || "",
    bio: response.data.metadata.content.bio,
  };
}
