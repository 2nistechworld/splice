# Splice

A daily word puzzle: find the one word that joins every clue.

```
FLASH ___
___ HOUSE
→ LIGHT   (flashlight, lighthouse)
```

Playable in **English** and **French** (EN/FR button in the header).

## How to play

- Each day there is one answer and five clues. Two clues are shown at the start; three are hidden.
- You get **5 turns**. Each turn, either **guess a word** or **tap a hidden clue** to reveal it.
- Your last turn must be a guess.
- A new puzzle every day at local midnight. Share your result as emojis:

```
🧩 Splice #12 3/5
🟦🟦🟨🟩🟩
🔓❌🎯
```

🟦 starting clue · 🟨 revealed clue · 🟩 clue you didn't need · 🔓 reveal · ❌ miss · 🎯 solved

## Run it

No build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

It also works as-is on any static host (e.g. GitHub Pages).

### URL options

| Parameter  | Effect                                                                 |
|------------|------------------------------------------------------------------------|
| `?lang=fr` | Open in French (`?lang=en` for English)                                |
| `?dev=1`   | Dev tools: "+1" button to jump to the next day; uses separate storage  |

## Files

| File          | Purpose                                         |
|---------------|-------------------------------------------------|
| `index.html`  | Page layout                                     |
| `styles.css`  | Styles (light and dark theme)                   |
| `app.js`      | Game logic, daily schedule, stats, translations |
| `words.js`    | English deck: 375 answers (about a year)        |
| `words-fr.js` | French deck: 60 answers (about two months)      |

## Word decks

Each row is an answer followed by 10 clues. In a clue, `*` stands for the answer:

```js
['LIGHT', 'FLASH*', '*HOUSE', ...]        // FLASHLIGHT, LIGHTHOUSE
['TERRE', 'POMME DE *', '*-PLEIN', ...]   // POMME DE TERRE, TERRE-PLEIN
```

- Clues 1–5 are **Set A**, clues 6–10 are **Set B**. The first two clues of each set are the starting clues, so together they must point to this answer only.
- Day N plays row N. After the last row, the deck repeats in a shuffled order using Set B, then mixed sets.
- **Only add new rows at the end.** Reordering or deleting rows changes past and upcoming puzzles.
- French answers keep their accents for display; players type them without accents (`TÊTE` → `TETE`, `CŒUR` → `COEUR`).

## Saved data

Everything is stored in the browser (`localStorage`): stats and streaks, the current day's board, sound and language settings. Each language has its own stats and streak. Nothing is sent to a server.
