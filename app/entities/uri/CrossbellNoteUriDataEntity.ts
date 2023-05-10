export default interface CrossbellNoteUriDataEntity {
  tags?: string[];
  type?: "note" | "linklist" | "character";
  content?: string;
  external_urls?: string[];
  sources?: string[];
}
