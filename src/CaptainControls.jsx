import React, { useState } from "react";
import { db } from "./firebase";
import { ref, update } from "firebase/database";

function CaptainControls({ roomId, gameState, me }) {
  const [clueWord, setClueWord] = useState("");
  const [clueCount, setClueCount] = useState(1);

  const isMyTurn = 
    (me.team === "A" && gameState.turn === "teamA_captain") ||
    (me.team === "B" && gameState.turn === "teamB_captain");

  if (me.role !== "captain" || !isMyTurn) return null;

  const submitClue = (e) => {
    e.preventDefault();
    if (!clueWord.trim()) return;

    const nextTurn = me.team === "A" ? "teamA_guess" : "teamB_guess";
    const roomRef = ref(db, `rooms/${roomId}`);

    update(roomRef, {
      turn: nextTurn,
      currentClue: { 
        word: clueWord.trim().toUpperCase(), 
        count: parseInt(clueCount, 10),
        guessesMade: 0 
      },
      votes: {} // Καθαρισμός προηγούμενων ψήφων
    });

    setClueWord("");
    setClueCount(1);
  };

  return (
    <div className="captain-panel">
      <h3>Δώσε το Στοιχείο</h3>
      <form onSubmit={submitClue} className="captain-form">
        <input
          type="text"
          placeholder="Λέξη (π.χ. ΩΚΕΑΝΟΣ)"
          value={clueWord}
          onChange={(e) => setClueWord(e.target.value)}
          required
        />
        <select value={clueCount} onChange={(e) => setClueCount(e.target.value)}>
          {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button type="submit">Αποστολή Στοιχείου</button>
      </form>
    </div>
  );
}

export default CaptainControls;