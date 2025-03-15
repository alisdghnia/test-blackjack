# Blackjack Game

A simple browser-based blackjack game with betting options.

## Features

- Play one-on-one against a dealer
- 4 decks of cards shuffled together
- Betting options: 5, 25, 100, 500, 1000 chips
- Standard blackjack rules
- Nice looking UI
- Hosted on localhost

## How to Play

1. Choose your bet by clicking on the chip values
2. Click "Deal" to start the hand
3. Choose your actions:
   - Hit: Take another card
   - Stand: End your turn, dealer plays
   - Double Down: Double your bet, take one card and stand
4. The dealer must hit on 16 or less and stand on 17 or more
5. Blackjack pays 3:2

## Rules

- Blackjack is an ace and a 10-value card (10, J, Q, K)
- Aces count as 1 or 11, whichever is more beneficial
- Beat the dealer without going over 21
- If you go over 21, you bust and lose your bet
- If the dealer busts, you win
- If there's a tie, it's a push and your bet is returned

## Getting Started

### Prerequisites

- Node.js installed on your machine

### Installation

1. Navigate to the game directory:
```
cd test-blackjack
```

2. Install dependencies:
```
npm install
```

3. Start the server:
```
npm start
```

4. Open your browser and go to:
```
http://localhost:3000
```

## Technologies Used

- HTML5
- CSS3
- JavaScript (vanilla)
- Node.js
- Express

## Customization

You can modify the game by editing the following files:
- `js/game.js` - Game logic
- `css/style.css` - Styling
- `index.html` - HTML structure