import React from "react";
import { db } from "./firebase";
import { ref, update } from "firebase/database";

function TeamControls({ roomId, gameState, me }) {
  const isMyTeamGuessing = 
    (me.team === "A" && gameState.turn === "teamA_guess") ||
    (me.team === "B" && gameState.turn === "teamB_guess");

  if (!isMyTeamGuessing) return null;

  const handleEndTurn = () => {
    const nextTurn = gameState.turn === "teamA_guess" ? "teamB_captain" : "teamA_captain";
    update(ref(db, `rooms/${roomId}`), { turn: nextTurn, votes: {} });
  };

  const submitGuess = () => {
    const votes = Object.values(gameState.votes || {});
    if (votes.length === 0) {
      alert("Πρέπει να επιλέξετε μια κάρτα πρώτα!");
      return;
    }

    // Βρίσκουμε την κάρτα με τις περισσότερες ψήφους
    const voteCounts = votes.reduce((acc, cardId) => {
      acc[cardId] = (acc[cardId] || 0) + 1;
      return acc;
    }, {});
    
    const targetCardId = parseInt(Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b), 10);
    const cardIndex = gameState.board.findIndex(c => c.id === targetCardId);
    const card = gameState.board[cardIndex];

    const currentTeamType = gameState.turn === "teamA_guess" ? "teamA" : "teamB";
    const opponentTeamType = gameState.turn === "teamA_guess" ? "teamB" : "teamA";
    
    let newBoard = [...gameState.board];
    newBoard[cardIndex].revealed = true;

    let updates = { board: newBoard, votes: {} };

    // Αξιολόγηση της κάρτας
    if (card.type === "penalty") {
      updates.status = "finished";
      updates.winner = opponentTeamType; // Η άλλη ομάδα κερδίζει
    } 
    else if (card.type === opponentTeamType || card.type === "neutral") {
      // Λάθος επιλογή, χάνουν τη σειρά τους
      updates.turn = gameState.turn === "teamA_guess" ? "teamB_captain" : "teamA_captain";
    } 
    else if (card.type === currentTeamType) {
      // Σωστή επιλογή
      const newGuessesMade = (gameState.currentClue.guessesMade || 0) + 1;
      
      // Έλεγχος νίκης (αν άνοιξαν και τις 10 λέξεις)
      const revealedCurrentTeam = newBoard.filter(c => c.type === currentTeamType && c.revealed).length;
      if (revealedCurrentTeam === 10) {
        updates.status = "finished";
        updates.winner = currentTeamType;
      } 
      // Έλεγχος αν έφτασαν το όριο προσπαθειών (+1 μπόνους)
      else if (newGuessesMade > gameState.currentClue.count) {
        updates.turn = gameState.turn === "teamA_guess" ? "teamB_captain" : "teamA_captain";
      } 
      else {
        updates.currentClue = { ...gameState.currentClue, guessesMade: newGuessesMade };
      }
    }

    update(ref(db, `rooms/${roomId}`), updates);
  };

  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px", padding: "20px", background: "#e9ecef", borderRadius: "8px" }}>
      <div>
        <h4 style={{ margin: "0 0 10px 0" }}>Ψηφοφορία Ομάδας</h4>
        <p style={{ margin: 0, fontSize: "14px" }}>Επιλέξτε μια λέξη στο ταμπλό. Μόλις συμφωνήσετε, πατήστε Υποβολή.</p>
        <p style={{ margin: "5px 0 0 0", fontSize: "14px", fontWeight: "bold" }}>
          Προσπάθειες: {gameState.currentClue.guessesMade || 0} / {gameState.currentClue.count + 1}
        </p>
      </div>
      
      {me.role === "member" && (
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={handleEndTurn} style={{ padding: "10px 20px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
            Πάσο
          </button>
          <button onClick={submitGuess} style={{ padding: "10px 20px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
            Οριστική Υποβολή
          </button>
        </div>
      )}
    </div>
  );
}

export default TeamControls;