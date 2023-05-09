import axios from "axios";
import { CROSSBELL } from "constants/crossbell";
import CrossbellChallengeEntity from "entities/CrossbellChallengeEntity";

export async function getLastCrossbellChallenge(): Promise<CrossbellChallengeEntity> {
  const response = await axios.get(
    `https://indexer.crossbell.io/v1/characters/${CROSSBELL.characterId}/notes`
  );
  const lastNote = response.data.list[0];
  const lastNoteCreatedAtTimestamp = new Date(lastNote.createdAt).valueOf();
  return {
    id: lastNote.noteId,
    startedTimestamp: lastNoteCreatedAtTimestamp,
    isActive:
      new Date().valueOf() - lastNoteCreatedAtTimestamp <
      CROSSBELL.challengeDurationMs,
  };
}
