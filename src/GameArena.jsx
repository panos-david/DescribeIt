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

  const boardArr = gameState.board || [];
  const remainingA = 10 - boardArr.filter(c => c.type === "teamA" && c.revealed).length;
  const remainingB = 10 - boardArr.filter(c => c.type === "teamB" && c.revealed).length;

  return (
    <div className="game-container">
      <header className="game-header">
        <div className="game-header-player">
          <h2>Παίζεις ως: {me.name}</h2>
          <p style={{ color: me.team === "A" ? "blue" : "red" }}>
            Ομάδα {me.team} — {me.role === "captain" ? "Αρχηγός" : "Μέλος"}
          </p>
        </div>
        <div className="game-score">
          <span style={{ color: "blue" }}>{remainingA}</span>
          {" - "}
          <span style={{ color: "red" }}>{remainingB}</span>
        </div>
        <div className="game-turn">
          Γύρος:<br/> {getTurnMessage()}
        </div>
      </header>

      {(gameState.turn === "teamA_guess" || gameState.turn === "teamB_guess") && gameState.currentClue.word && (
        <div className="game-clue-banner">
          Στοιχείο: <strong style={{ letterSpacing: "2px" }}>{gameState.currentClue.word}</strong> — Λέξεις: <strong>{gameState.currentClue.count}</strong>
        </div>
      )}

      <Board roomId={roomId} gameState={gameState} me={me} />
      
      <CaptainControls roomId={roomId} gameState={gameState} me={me} />
      <TeamControls roomId={roomId} gameState={gameState} me={me} />

    </div>
  );
}

export default GameArea;