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

    // Στο επόμενο βήμα θα ενσωματωθεί εδώ η γεννήτρια των 25 λέξεων (10-10-2-3)
    const roomRef = ref(db, `rooms/${roomId}`);
    update(roomRef, { status: "playing" });
  };

  return (
    <div style={{ maxWidth: "600px", margin: "40px auto", padding: "20px", fontFamily: "sans-serif", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Δωμάτιο: {roomId}</h2>
      <div style={{ background: "#f0f0f0", padding: "10px", marginBottom: "20px", borderRadius: "4px" }}>
        <strong>Link Πρόσκλησης:</strong> 
        <input readOnly value={inviteLink} style={{ width: "100%", marginTop: "5px", padding: "5px" }} onClick={(e) => e.target.select()} />
      </div>

      {!currentPlayer ? (
        <form onSubmit={joinLobby}>
          <h3>Είσοδος στο παιχνίδι</h3>
          <input 
            type="text" 
            placeholder="Εισάγετε το όνομά σας" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            style={{ padding: "8px", width: "70%", marginRight: "10px" }}
            required 
          />
          <button type="submit" style={{ padding: "8px 16px" }}>Είσοδος</button>
        </form>
      ) : (
        <div>
          <h3>Οι Επιλογές σου</h3>
          <div style={{ marginBottom: "15px" }}>
            <span style={{ marginRight: "10px" }}>Ομάδα:</span>
            <button onClick={() => updateSelection("team", "A")} style={{ padding: "6px 12px", marginRight: "5px", fontWeight: currentPlayer.team === "A" ? "bold" : "normal" }}>Ομάδα Α</button>
            <button onClick={() => updateSelection("team", "B")} style={{ padding: "6px 12px", fontWeight: currentPlayer.team === "B" ? "bold" : "normal" }}>Ομάδα Β</button>
          </div>

          <div style={{ marginBottom: "25px" }}>
            <span style={{ marginRight: "10px" }}>Ρόλος:</span>
            <button onClick={() => updateSelection("role", "captain")} style={{ padding: "6px 12px", marginRight: "5px", fontWeight: currentPlayer.role === "captain" ? "bold" : "normal" }}>Αρχηγός</button>
            <button onClick={() => updateSelection("role", "member")} style={{ padding: "6px 12px", fontWeight: currentPlayer.role === "member" ? "bold" : "normal" }}>Μέλος</button>
          </div>

          <h3>Σύνθεση Δωματίου</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "15px" }}>
            <div style={{ width: "48%", border: "1px solid #00f", padding: "10px", borderRadius: "4px" }}>
              <h4 style={{ color: "#00f", margin: "0 0 10px 0" }}>Ομάδα Α</h4>
              {Object.values(players).filter(p => p.team === "A").map((p, i) => (
                <p key={i} style={{ margin: "5px 0" }}>{p.name} - <strong>{p.role === "captain" ? "Αρχηγός" : "Μέλος"}</strong></p>
              ))}
            </div>
            <div style={{ width: "48%", border: "1px solid #r00", padding: "10px", borderRadius: "4px" }}>
              <h4 style={{ color: "#f00", margin: "0 0 10px 0" }}>Ομάδα Β</h4>
              {Object.values(players).filter(p => p.team === "B").map((p, i) => (
                <p key={i} style={{ margin: "5px 0" }}>{p.name} - <strong>{p.role === "captain" ? "Αρχηγός" : "Μέλος"}</strong></p>
              ))}
            </div>
          </div>

          <button onClick={startGame} style={{ marginTop: "30px", width: "100%", padding: "12px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", fontSize: "16px", cursor: "pointer" }}>
            Έναρξη Παιχνιδιού
          </button>
        </div>
      )}
    </div>
  );
}

const startGame = () => {
    const hasCaptainA = Object.values(players).some(p => p.team === "A" && p.role === "captain");
    const hasCaptainB = Object.values(players).some(p => p.team === "B" && p.role === "captain");

    if (!hasCaptainA || !hasCaptainB) {
      alert("Πρέπει να οριστεί ένας αρχηγός για κάθε ομάδα προτού ξεκινήσετε.");
      return;
    }

    const newBoard = generateBoard();
    const roomRef = ref(db, `rooms/${roomId}`);
    
    // Ενημερώνουμε το state του δωματίου για να ξεκινήσει το παιχνίδι
    update(roomRef, { 
      status: "playing",
      board: newBoard,
      turn: "teamA_captain", // Ξεκινάει ο αρχηγός της Α
      currentClue: { word: "", count: 0 },
      votes: {}
    });
  };

export default Lobby;