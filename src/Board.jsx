import React from "react";
import { db } from "./firebase";
import { ref, update } from "firebase/database";

function Board({ roomId, gameState, me }) {
  const board = gameState.board || [];

  const handleCardClick = (cardIndex) => {
    // Μόνο τα μέλη μπορούν να πατήσουν κάρτες (όχι οι αρχηγοί)
    if (me.role === "captain") return;
    
    // Πρέπει να είναι η σειρά της ομάδας τους για να μαντέψουν
    const isMyTurnToGuess = 
      (me.team === "A" && gameState.turn === "teamA_guess") ||
      (me.team === "B" && gameState.turn === "teamB_guess");

    if (!isMyTurnToGuess) return;
    
    // Δεν ψηφίζουμε κάρτες που έχουν ήδη ανοίξει
    if (board[cardIndex].revealed) return;

    // Καταγραφή της ψήφου του παίκτη στη βάση
    const votesRef = ref(db, `rooms/${roomId}/votes`);
    update(votesRef, {
      [me.name]: cardIndex // Χρησιμοποιούμε το όνομα (ή το playerId) ως κλειδί
    });
  };

  const getCardStyle = (card) => {
    const isCaptain = me.role === "captain";
    let bgColor = "#eee";
    let textColor = "#333";
    let border = "2px solid #ccc";
    let opacity = 1;

    // Χρωματική λογική
    const assignColors = () => {
      switch (card.type) {
        case "teamA": bgColor = "#cce5ff"; border = "2px solid #0056b3"; textColor = "#004085"; break;
        case "teamB": bgColor = "#f8d7da"; border = "2px solid #c82333"; textColor = "#721c24"; break;
        case "neutral": bgColor = "#e2e3e5"; border = "2px solid #6c757d"; textColor = "#383d41"; break;
        case "penalty": bgColor = "#343a40"; border = "2px solid #000"; textColor = "#fff"; break;
        default: break;
      }
    };

    if (card.revealed) {
      assignColors();
    } else if (isCaptain) {
      assignColors();
      opacity = 0.6; // Ο αρχηγός βλέπει τα χρώματα αλλά ξεχωρίζει ποιες είναι κλειστές
    }

    // Αν κάποιος παίκτης έχει ψηφίσει αυτή την κάρτα, προσθέτουμε ένα visual cue
    const votesOnThisCard = Object.values(gameState.votes || {}).filter(v => v === card.id).length;
    if (votesOnThisCard > 0 && !card.revealed) {
      border = "2px dashed #ffc107"; // Κίτρινο περίγραμμα για τις ψήφους
    }

    return {
      background: bgColor,
      color: textColor,
      border: border,
      opacity: opacity,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: "100px",
      fontSize: "18px",
      fontWeight: "bold",
      borderRadius: "8px",
      cursor: (me.role === "member" && !card.revealed) ? "pointer" : "default",
      userSelect: "none",
      transition: "all 0.2s ease-in-out"
    };
  };

  return (
    <div style={{ 
      display: "grid", 
      gridTemplateColumns: "repeat(5, 1fr)", 
      gap: "10px", 
      margin: "20px 0" 
    }}>
      {board.map((card, index) => (
        <div 
          key={card.id} 
          style={getCardStyle(card)}
          onClick={() => handleCardClick(index)}
        >
          {card.word}
          {/* Δείκτης ψήφων αν υπάρχουν */}
          {Object.values(gameState.votes || {}).filter(v => v === card.id).length > 0 && !card.revealed && (
            <div style={{ position: "absolute", marginTop: "60px", fontSize: "12px", background: "#ffc107", color: "#000", padding: "2px 6px", borderRadius: "10px" }}>
              {Object.values(gameState.votes || {}).filter(v => v === card.id).length} ψήφοι
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Board;