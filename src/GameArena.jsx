import React from "react";
import Board from "./Board";
import CaptainControls from "./CaptainControls";
import TeamControls from "./TeamControls";

function GameArea({ roomId, gameState, playerId }) {
  const players = gameState.players || {};
  const me = players[playerId];

  if (!me) return <div>Σφάλμα: Δεν βρέθηκαν τα δεδομένα του παίκτη.</div>;

  if (gameState.status === "finished") {
    const winnerText = gameState.winner === "teamA" ? "Η ΟΜΑΔΑ Α!" : "Η ΟΜΑΔΑ Β!";
    const winnerColor = gameState.winner === "teamA" ? "blue" : "red";
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
        <h1>Το Παιχνίδι Τελείωσε</h1>
        <h2 style={{ color: winnerColor }}>Νικήτρια είναι {winnerText}</h2>
        <p>Φτιάξτε νέο δωμάτιο για να ξαναπαίξετε.</p>
      </div>
    );
  }

  const getTurnMessage = () => {
    switch (gameState.turn) {
      case "teamA_captain": return "Αναμονή για λέξη από τον Αρχηγό της Ομάδας Α";
      case "teamA_guess": return "Η Ομάδα Α μαντεύει...";
      case "teamB_captain": return "Αναμονή για λέξη από τον Αρχηγό της Ομάδας Β";
      case "teamB_guess": return "Η Ομάδα Β μαντεύει...";
      default: return "Άγνωστη Κατάσταση";
    }
  };

  // Υπολογισμός υπολειπόμενων λέξεων
  const remainingA = 10 - (gameState.board?.filter(c => c.type === "teamA" && c.revealed).length || 0);
  const remainingB = 10 - (gameState.board?.filter(c => c.type === "teamB" && c.revealed).length || 0);

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto", fontFamily: "sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #ccc", paddingBottom: "10px" }}>
        <div>
          <h2 style={{ margin: 0 }}>Παίζεις ως: {me.name}</h2>
          <p style={{ margin: "5px 0", color: me.team === "A" ? "blue" : "red", fontWeight: "bold" }}>
            Ομάδα {me.team} - {me.role === "captain" ? "Αρχηγός" : "Μέλος"}
          </p>
        </div>
        
        <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "18px" }}>
          <span style={{ color: "blue" }}>{remainingA}</span> - <span style={{ color: "red" }}>{remainingB}</span>
        </div>

        <div style={{ padding: "10px 20px", background: "#f0f0f0", borderRadius: "8px", fontWeight: "bold", textAlign: "right" }}>
          Γύρος:<br/> {getTurnMessage()}
        </div>
      </header>

      {(gameState.turn === "teamA_guess" || gameState.turn === "teamB_guess") && gameState.currentClue.word && (
        <div style={{ textAlign: "center", padding: "15px", margin: "20px 0", background: "#fff3cd", border: "1px solid #ffeeba", borderRadius: "8px", fontSize: "20px" }}>
          Το Στοιχείο: <strong style={{ letterSpacing: "2px" }}>{gameState.currentClue.word}</strong> | Λέξεις: <strong>{gameState.currentClue.count}</strong>
        </div>
      )}

      <Board roomId={roomId} gameState={gameState} me={me} />
      
      <CaptainControls roomId={roomId} gameState={gameState} me={me} />
      <TeamControls roomId={roomId} gameState={gameState} me={me} />

    </div>
  );
}

export default GameArea;