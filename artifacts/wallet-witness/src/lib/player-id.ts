const PLAYER_ID_KEY = "walletWitnessPlayerId";

/**
 * Returns a stable player identifier persisted in localStorage.
 * Generated once and reused across all sessions so the leaderboard
 * can highlight the current player's entries.
 */
export function getPlayerId(): string {
  let id = localStorage.getItem(PLAYER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(PLAYER_ID_KEY, id);
  }
  return id;
}
