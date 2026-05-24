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
    <div className="team-controls">
      <div className="team-controls-info">
        <h4>Ψηφοφορία Ομάδας</h4>
        <p>Επιλέξτε μια λέξη στο ταμπλό. Μόλις συμφωνήσετε, πατήστε Υποβολή.</p>
        <p><strong>Προσπάθειες: {gameState.currentClue.guessesMade || 0} / {gameState.currentClue.count + 1}</strong></p>
      </div>
      {me.role === "member" && (
        <div className="team-buttons">
          <button onClick={handleEndTurn} style={{ background: "#6c757d", color: "white" }}>Πάσο</button>
          <button onClick={submitGuess} style={{ background: "#28a745", color: "white" }}>Οριστική Υποβολή</button>
        </div>
      )}
    </div>
  );
}

export default TeamControls;