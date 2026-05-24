// Κάνουμε import απευθείας το JSON αρχείο
import DICTIONARY from './words.json';

function shuffleArray(array) {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

export function generateBoard() {
  const shuffledWords = shuffleArray(DICTIONARY).slice(0, 25);
  
  const types = [
    ...Array(10).fill("teamA"),
    ...Array(10).fill("teamB"),
    ...Array(2).fill("neutral"),
    ...Array(3).fill("penalty")
  ];
  
  const shuffledTypes = shuffleArray(types);
  
  return shuffledWords.map((word, index) => ({
    id: index,
    word: word,
    type: shuffledTypes[index],
    revealed: false
  }));
}