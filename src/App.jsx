import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, set, onValue } from "firebase/database";
import Lobby from "./Lobby";

function App() {
  const [roomId, setRoomId] = useState("");
  const [gameState, setGameState] = useState(null);
  const [playerId, setPlayerId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get("room");
    if (roomParam) {
      setRoomId(roomParam);
    }
    
    let pId = localStorage.getItem("playerId");
    if (!pId) {
      pId = "p_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("playerId", pId);
    }
    setPlayerId(pId);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    const roomRef = ref(db, `rooms/${roomId}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setGameState(snapshot.val());
      } else {
        setGameState(null);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  const createRoom = () => {
    const newRoomId = "room_" + Math.random().toString(36).substring(2, 8);
    const roomRef = ref(db, `rooms/${newRoomId}`);
    
    const initialState = {
      status: "lobby",
      turn: "teamA_captain",
      players: {},
      board: [],
      currentClue: { word: "", count: 0 },
      votes: {}
    };

    set(roomRef, initialState).then(() => {
      window.history.pushState({}, "", `?room=${newRoomId}`);
      setRoomId(newRoomId);
    });
  };

  if (!roomId) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
        <h1>Codenames Multiplayer</h1>
        <button onClick={createRoom} style={{ padding: "12px 24px", fontSize: "16px", cursor: "pointer" }}>
          Δημιουργία Νέου Δωματίου
        </button>
      </div>
    );
  }

  if (!gameState) {
    return <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>Αναζήτηση ή φόρτωση δωματίου...</div>;
  }

  if (gameState.status === "lobby") {
    return <Lobby roomId={roomId} gameState={gameState} playerId={playerId} />;
  }

  return (
    <div style={{ textAlign: "center", marginTop: "100px", fontFamily: "sans-serif" }}>
      <h2>Το παιχνίδι ξεκίνησε!</h2>
      {/* Εδώ θα γίνει render το GameArea component στο επόμενο βήμα */}
    </div>
  );
}

export default App;