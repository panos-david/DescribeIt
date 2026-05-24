import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, set, remove, onValue } from "firebase/database";
import Lobby from "./Lobby";
import GameArea from "./GameArena";

const ROOM_TTL_MS = 2 * 60 * 60 * 1000; // 2 ώρες

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
        const data = snapshot.val();
        // Firebase αποθηκεύει arrays ως objects — τα κανονικοποιούμε
        if (data.board && !Array.isArray(data.board)) {
          data.board = Object.values(data.board);
        } else if (!data.board) {
          data.board = [];
        }
        // TTL: διαγραφή δωματίου αν έχει λήξει
        if (data.createdAt && Date.now() - data.createdAt > ROOM_TTL_MS) {
          remove(roomRef);
          return;
        }
        setGameState(data);
      } else {
        setGameState(null);
      }
    });

    return () => unsubscribe();
  }, [roomId]);

  // Αυτόματη διαγραφή 60s μετά τη λήξη του παιχνιδιού
  useEffect(() => {
    if (gameState?.status === "finished" && roomId) {
      const roomRef = ref(db, `rooms/${roomId}`);
      const timer = setTimeout(() => remove(roomRef), 60000);
      return () => clearTimeout(timer);
    }
  }, [gameState?.status, roomId]);

  const createRoom = () => {
    const newRoomId = "room_" + Math.random().toString(36).substring(2, 8);
    const roomRef = ref(db, `rooms/${newRoomId}`);
    
    const initialState = {
      status: "lobby",
      turn: "teamA_captain",
      players: {},
      board: [],
      currentClue: { word: "", count: 0, guessesMade: 0 },
      votes: {},
      createdAt: Date.now()
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

  return <GameArea roomId={roomId} gameState={gameState} playerId={playerId} />;
}

export default App;