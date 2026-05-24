import React, { useState } from "react";
import { db } from "./firebase";
import { ref, update } from "firebase/database";
import { generateBoard } from "./words";

function Lobby({ roomId, gameState, playerId }) {
  const [name, setName] = useState("");
  const players = gameState.players || {};
  const currentPlayer = players[playerId];

  const joinLobby = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
    update(playerRef, {
      name: name.trim(),
      team: "A", 
      role: "member" 
    });
  };

  const updateSelection = (field, value) => {
    if (!currentPlayer) return;
    
    if (field === "role" && value === "captain") {
      const currentTeam = currentPlayer.team;
      const hasCaptain = Object.values(players).some(
        (p) => p.team === currentTeam && p.role === "captain"
      );
      if (hasCaptain) {
        alert("Υπάρχει ήδη αρχηγός σε αυτή την ομάδα!");
        return;
      }
    }

    let updates = { [field]: value };
    if (field === "team" && currentPlayer.role === "captain") {
      updates.role = "member";
    }

    const playerRef = ref(db, `rooms/${roomId}/players/${playerId}`);
    update(playerRef, updates);
  };

  const inviteLink = `${window.location.origin}${window.location.pathname}?room=${roomId}`;

  const startGame = () => {
    const hasCaptainA = Object.values(players).some(p => p.team === "A" && p.role === "captain");
    const hasCaptainB = Object.values(players).some(p => p.team === "B" && p.role === "captain");

    if (!hasCaptainA || !hasCaptainB) {
      alert("Πρέπει να οριστεί ένας αρχηγός για κάθε ομάδα προτού ξεκινήσετε.");
      return;
    }

    const board = generateBoard();
    const roomRef = ref(db, `rooms/${roomId}`);
    update(roomRef, { status: "playing", board, turn: "teamA_captain" });
  };

  return (
    <div className="lobby-container">
      <h2>Δωμάτιο: {roomId}</h2>
      <div className="lobby-link-box">
        <strong>Link Πρόσκλησης:</strong>
        <input readOnly value={inviteLink} onClick={(e) => e.target.select()} />
      </div>

      {!currentPlayer ? (
        <form onSubmit={joinLobby} className="lobby-join-form">
          <h3 style={{ width: "100%", margin: "0 0 8px" }}>Είσοδος στο παιχνίδι</h3>
          <input
            type="text"
            placeholder="Εισάγετε το όνομά σας"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <button type="submit">Είσοδος</button>
        </form>
      ) : (
        <div>
          <h3>Οι Επιλογές σου</h3>
          <div className="lobby-selection">
            <span>Ομάδα:</span>
            <button onClick={() => updateSelection("team", "A")} style={{ fontWeight: currentPlayer.team === "A" ? "bold" : "normal" }}>Ομάδα Α</button>
            <button onClick={() => updateSelection("team", "B")} style={{ fontWeight: currentPlayer.team === "B" ? "bold" : "normal" }}>Ομάδα Β</button>
          </div>
          <div className="lobby-selection">
            <span>Ρόλος:</span>
            <button onClick={() => updateSelection("role", "captain")} style={{ fontWeight: currentPlayer.role === "captain" ? "bold" : "normal" }}>Αρχηγός</button>
            <button onClick={() => updateSelection("role", "member")} style={{ fontWeight: currentPlayer.role === "member" ? "bold" : "normal" }}>Μέλος</button>
          </div>

          <h3>Σύνθεση Δωματίου</h3>
          <div className="lobby-teams">
            <div className="lobby-team-box" style={{ border: "1px solid #00f" }}>
              <h4 style={{ color: "#00f", margin: "0 0 8px" }}>Ομάδα Α</h4>
              {Object.values(players).filter(p => p.team === "A").map((p, i) => (
                <p key={i}>{p.name} — <strong>{p.role === "captain" ? "Αρχηγός" : "Μέλος"}</strong></p>
              ))}
            </div>
            <div className="lobby-team-box" style={{ border: "1px solid #f00" }}>
              <h4 style={{ color: "#f00", margin: "0 0 8px" }}>Ομάδα Β</h4>
              {Object.values(players).filter(p => p.team === "B").map((p, i) => (
                <p key={i}>{p.name} — <strong>{p.role === "captain" ? "Αρχηγός" : "Μέλος"}</strong></p>
              ))}
            </div>
          </div>

          <button onClick={startGame} className="lobby-start-btn">
            Έναρξη Παιχνιδιού
          </button>
        </div>
      )}
    </div>
  );
}

export default Lobby;