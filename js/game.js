// Game state variables
let deck = [];
let dealerCards = [];
let playerCards = [];
let dealerSum = 0;
let playerSum = 0;
let playerChips = 1000;
let currentBet = 0;
let gameInProgress = false;
let dealersTurn = false;
let canDouble = false;
let dealingInProgress = false;

// Track bets with chip denominations
let betChips = []; // Array to store the individual chips placed as bets

// Split functionality variables
let splitCards = [];
let splitSum = 0;
let hasSplit = false;
let canSplit = false;
let activeSplitHand = false; // false = main hand, true = split hand
let splitResults = { main: "", split: "" }; // Track results for each hand

// DOM elements
const dealerSumElement = document.getElementById('dealer-sum');
const playerSumElement = document.getElementById('player-sum');
const dealerCardsElement = document.getElementById('dealer-cards');
const playerCardsElement = document.getElementById('player-cards');
const playerChipsElement = document.getElementById('player-chips');
const currentBetElement = document.getElementById('current-bet');
const messagesElement = document.getElementById('messages');
const splitAreaElement = document.getElementById('split-area');
const splitCardsElement = document.getElementById('split-cards');
const splitSumElement = document.getElementById('split-sum');
const betChipsAreaElement = document.getElementById('bet-chips-area');

// Buttons
const dealBtn = document.getElementById('deal-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const doubleBtn = document.getElementById('double-btn');
const splitBtn = document.getElementById('split-btn');
const newGameBtn = document.getElementById('new-game-btn');
const betButtons = document.querySelectorAll('.bet-btn');
const reduceBetBtn = document.getElementById('reduce-bet-btn');
const clearBetBtn = document.getElementById('clear-bet-btn');

// Card values and suits
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits = [
    { symbol: 'S', name: 'spades', color: 'black' },
    { symbol: 'H', name: 'hearts', color: 'red' },
    { symbol: 'D', name: 'diamonds', color: 'red' },
    { symbol: 'C', name: 'clubs', color: 'black' }
];

// Chip colors and gradients for visual representation
const chipStyles = {
    '5': 'linear-gradient(145deg, #e61919, #c21414)',
    '25': 'linear-gradient(145deg, #1e88e5, #1565c0)',
    '100': 'linear-gradient(145deg, #43a047, #2e7d32)',
    '500': 'linear-gradient(145deg, #7b1fa2, #5e1882)',
    '1000': 'linear-gradient(145deg, #ffb300, #fb8c00)'
};

// Card images base URL - use a more reliable source
const cardImagesBaseUrl = 'https://www.deckofcardsapi.com/static/img/';

// Initialize game
function initGame() {
    playerChips = 1000;
    updateChipsDisplay();
    buildDeck();
    shuffleDeck();
    displayMessage('Place your bet and click Deal to start a new game!');
    
    // Clear any existing bet chips
    betChips = [];
    renderBetChips();
}

// Create a deck with 4 decks of cards (208 cards)
function buildDeck() {
    deck = [];
    // Create 4 decks
    for (let d = 0; d < 4; d++) {
        for (let s = 0; s < suits.length; s++) {
            for (let v = 0; v < values.length; v++) {
                const card = {
                    value: values[v],
                    suit: suits[s].symbol,
                    color: suits[s].color,
                    numericValue: getCardValue(values[v]),
                    // Format for the card API: 2H.png, KS.png, etc.
                    // Ace is A, Jack is J, Queen is Q, King is K
                    imageUrl: `${cardImagesBaseUrl}${values[v]}${suits[s].symbol}.png`
                };
                deck.push(card);
            }
        }
    }
}

// Shuffle the deck using Fisher-Yates algorithm
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Get numeric value of a card
function getCardValue(value) {
    if (value === 'A') return 11;
    if (['J', 'Q', 'K'].includes(value)) return 10;
    return parseInt(value);
}

// Deal a card from the deck
function dealCard() {
    // Rebuild and shuffle deck if running low on cards (less than 20% remaining)
    if (deck.length < 52) {
        buildDeck();
        shuffleDeck();
        displayMessage('Shuffling a new set of decks...', 2000);
    }
    return deck.pop();
}

// Calculate the sum of cards accounting for Aces
function calculateSum(cards) {
    let sum = 0;
    let aces = 0;
    
    for (let card of cards) {
        sum += card.numericValue;
        if (card.value === 'A') {
            aces++;
        }
    }
    
    // Adjust for Aces if sum is over 21
    while (sum > 21 && aces > 0) {
        sum -= 10; // Convert Ace from 11 to 1
        aces--;
    }
    
    return sum;
}

// Alternative method to render card contents directly in HTML rather than using external images
function getCardHTML(card) {
    if (!card) return '';
    
    const suitSymbols = {
        'S': '♠',
        'H': '♥',
        'D': '♦',
        'C': '♣'
    };
    
    const suitColors = {
        'S': 'black',
        'H': 'red',
        'D': 'red',
        'C': 'black'
    };
    
    return `
        <div class="card-corner top-left">
            <div class="card-value">${card.value}</div>
            <div class="card-suit" style="color: ${suitColors[card.suit]}">${suitSymbols[card.suit]}</div>
        </div>
        <div class="card-center" style="color: ${suitColors[card.suit]}">
            ${suitSymbols[card.suit]}
        </div>
        <div class="card-corner bottom-right">
            <div class="card-value">${card.value}</div>
            <div class="card-suit" style="color: ${suitColors[card.suit]}">${suitSymbols[card.suit]}</div>
        </div>
    `;
}

// Display a card in the UI with proper card image
function displayCard(card, container, isHidden = false, delay = 0) {
    return new Promise(resolve => {
        setTimeout(() => {
            const cardElement = document.createElement('div');
            cardElement.className = `card`;
            
            // Add animation-delay as a data attribute to prevent animation conflicts
            cardElement.dataset.animDelay = delay;
            
            if (!isHidden) {
                // Try to set background image first
                if (card.imageUrl) {
                    cardElement.style.backgroundImage = `url(${card.imageUrl})`;
                    
                    // Add error handling for image loading
                    const imgTest = new Image();
                    imgTest.onload = () => {
                        // Image loaded successfully
                        cardElement.style.backgroundImage = `url(${card.imageUrl})`;
                    };
                    imgTest.onerror = () => {
                        // Fallback to HTML rendering if image fails to load
                        cardElement.style.backgroundImage = '';
                        cardElement.innerHTML = getCardHTML(card);
                    };
                    imgTest.src = card.imageUrl;
                } else {
                    // Use HTML rendering as fallback
                    cardElement.innerHTML = getCardHTML(card);
                }
                
                // Add color class
                cardElement.classList.add(card.color);
            } else {
                cardElement.classList.add('hidden');
            }
            
            // Apply animation with JavaScript to ensure it only runs once
            requestAnimationFrame(() => {
                cardElement.style.animationDelay = `${delay}s`;
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'translateY(-50px) rotate(-10deg)';
                
                // Force reflow to ensure animation runs
                void cardElement.offsetWidth;
                
                cardElement.style.transition = `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`;
                cardElement.style.opacity = '1';
                cardElement.style.transform = 'translateY(0) rotate(0)';
            });
            
            container.appendChild(cardElement);
            
            // Wait for animation to complete
            setTimeout(resolve, (delay + 0.5) * 1000);
        }, 0);
    });
}

// Display a hidden card (for dealer's hole card)
function displayHiddenCard(container, delay = 0) {
    return new Promise(resolve => {
        setTimeout(() => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card hidden';
            
            // Apply animation with JavaScript to ensure it only runs once
            requestAnimationFrame(() => {
                cardElement.style.animationDelay = `${delay}s`;
                cardElement.style.opacity = '0';
                cardElement.style.transform = 'translateY(-50px) rotate(-10deg)';
                
                // Force reflow to ensure animation runs
                void cardElement.offsetWidth;
                
                cardElement.style.transition = `opacity 0.5s ease-out ${delay}s, transform 0.5s ease-out ${delay}s`;
                cardElement.style.opacity = '1';
                cardElement.style.transform = 'translateY(0) rotate(0)';
            });
            
            container.appendChild(cardElement);
            
            // Wait for animation to complete
            setTimeout(resolve, (delay + 0.5) * 1000);
        }, 0);
    });
}

// Add a single new card to the display without redrawing existing cards
async function addNewCard(card, container, isHidden = false) {
    dealingInProgress = true;
    
    // Display only the new card with animation
    if (isHidden) {
        await displayHiddenCard(container, 0);
    } else {
        await displayCard(card, container, false, 0);
    }
    
    dealingInProgress = false;
}

// Reveal the dealer's hidden card
async function revealDealerCard() {
    // Remove the hidden card (second card)
    if (dealerCardsElement.childNodes.length >= 2) {
        dealerCardsElement.removeChild(dealerCardsElement.childNodes[1]);
    }
    
    // Add the real second card
    await displayCard(dealerCards[1], dealerCardsElement, false, 0);
}

// Update the display of dealer and player cards with animations
async function updateCardDisplay(isInitialDeal = false) {
    // For the initial deal, we clear and rebuild the display
    if (isInitialDeal) {
        dealerCardsElement.innerHTML = '';
        playerCardsElement.innerHTML = '';
        splitCardsElement.innerHTML = '';
        splitAreaElement.style.display = 'none';
        
        dealingInProgress = true;
        
        // Deal cards one by one with animation
        await displayCard(playerCards[0], playerCardsElement, false, 0);
        await displayCard(dealerCards[0], dealerCardsElement, false, 0.3);
        await displayCard(playerCards[1], playerCardsElement, false, 0.6);
        
        if (dealersTurn) {
            await displayCard(dealerCards[1], dealerCardsElement, false, 0.9);
        } else {
            await displayHiddenCard(dealerCardsElement, 0.9);
        }
        
        dealingInProgress = false;
    } 
    // For dealer's turn, we need to reveal the hidden card
    else if (dealersTurn && dealerCardsElement.querySelector('.card.hidden')) {
        await revealDealerCard();
    }
    
    // Update sums
    dealerSumElement.textContent = dealersTurn ? dealerSum : dealerCards[0].numericValue;
    playerSumElement.textContent = playerSum;
    
    if (hasSplit) {
        splitSumElement.textContent = splitSum;
    }
    
    // Update active hand highlighting
    if (hasSplit && gameInProgress && !dealersTurn) {
        if (activeSplitHand) {
            playerCardsElement.parentElement.classList.remove('active-hand');
            splitAreaElement.classList.add('active-hand');
        } else {
            playerCardsElement.parentElement.classList.add('active-hand');
            splitAreaElement.classList.remove('active-hand');
        }
    } else {
        playerCardsElement.parentElement.classList.remove('active-hand');
        splitAreaElement.classList.remove('active-hand');
    }
}

// Create a visual representation of a betting chip
function createChipElement(value) {
    const chipElement = document.createElement('div');
    chipElement.className = 'chip-in-bet chip-added';
    chipElement.dataset.value = value;
    chipElement.textContent = value;
    chipElement.style.background = chipStyles[value];
    
    // Add event listener to remove this chip when clicked (if not in a game)
    chipElement.addEventListener('click', function() {
        if (!gameInProgress && !dealingInProgress) {
            removeChip(this);
        }
    });
    
    return chipElement;
}

// Add a chip to the bet area
function addChipToBetArea(value) {
    const chipElement = createChipElement(value);
    betChipsAreaElement.appendChild(chipElement);
}

// Remove a chip from the bet area
function removeChip(chipElement) {
    const chipValue = parseInt(chipElement.dataset.value);
    
    // Return the value to player's chips
    playerChips += chipValue;
    
    // Remove the chip from the betChips array
    const index = betChips.findIndex(value => value === chipValue);
    if (index !== -1) {
        betChips.splice(index, 1);
    }
    
    // Update the current bet
    currentBet -= chipValue;
    
    // Remove the chip element from the DOM
    chipElement.remove();
    
    // Update displays
    updateChipsDisplay();
}

// Render the bet chips in the bet area
function renderBetChips() {
    // Clear the bet area
    betChipsAreaElement.innerHTML = '';
    
    // Add each chip
    for (const chipValue of betChips) {
        addChipToBetArea(chipValue);
    }
}

// Update chips display
function updateChipsDisplay() {
    playerChipsElement.textContent = playerChips;
    currentBetElement.textContent = currentBet;
    
    // Update bet buttons based on available chips
    betButtons.forEach(btn => {
        const betAmount = parseInt(btn.dataset.bet);
        btn.disabled = betAmount > playerChips || gameInProgress;
    });
    
    // Update reduce/clear buttons
    reduceBetBtn.disabled = currentBet <= 0 || gameInProgress;
    clearBetBtn.disabled = currentBet <= 0 || gameInProgress;
    
    // Update deal button
    dealBtn.disabled = currentBet <= 0 || gameInProgress;
}

// Display message
function displayMessage(message, timeout = 0) {
    messagesElement.textContent = message;
    if (timeout > 0) {
        setTimeout(() => {
            messagesElement.textContent = '';
        }, timeout);
    }
}

// Check if the player can split their cards
function checkForSplit() {
    // Can only split with exactly 2 cards
    if (playerCards.length !== 2) return false;
    
    // Cards must have the same value (10, J, Q, K are all value 10)
    const firstCardValue = playerCards[0].numericValue;
    const secondCardValue = playerCards[1].numericValue;
    
    // Player must have enough chips to place another equal bet
    const canAffordSplit = playerChips >= currentBet;
    
    return firstCardValue === secondCardValue && canAffordSplit;
}

// Start a new hand
async function startHand() {
    if (currentBet <= 0) {
        displayMessage('Please place a bet first!');
        return;
    }
    
    if (dealingInProgress) return;
    
    // Reset split-related variables
    hasSplit = false;
    canSplit = false;
    activeSplitHand = false;
    splitCards = [];
    splitSum = 0;
    splitResults = { main: "", split: "" };
    splitAreaElement.style.display = 'none';
    
    gameInProgress = true;
    dealersTurn = false;
    
    // Clear previous cards
    dealerCards = [];
    playerCards = [];
    
    // Deal initial cards (2 each)
    playerCards.push(dealCard());
    dealerCards.push(dealCard());
    playerCards.push(dealCard());
    dealerCards.push(dealCard());
    
    // Calculate sums
    playerSum = calculateSum(playerCards);
    dealerSum = calculateSum(dealerCards);
    
    // Update display with animation
    await updateCardDisplay(true);
    
    // Enable game buttons
    hitBtn.disabled = false;
    standBtn.disabled = false;
    doubleBtn.disabled = playerChips < currentBet ? true : false;
    dealBtn.disabled = true;
    
    // Check if player can split
    canSplit = checkForSplit();
    splitBtn.disabled = !canSplit;
    
    // Check for blackjack
    if (playerSum === 21) {
        if (dealerSum === 21) {
            // Both have blackjack - it's a push
            endHand('push');
        } else {
            // Player has blackjack
            endHand('blackjack');
        }
    } else {
        canDouble = true;
        displayMessage('Your turn! Hit, Stand, Double or Split');
    }
    
    // Disable bet buttons during hand
    updateChipsDisplay();
}

// Player hits (takes another card)
async function hit() {
    if (!gameInProgress || dealersTurn || dealingInProgress) return;
    
    // Can't double after hitting
    canDouble = false;
    doubleBtn.disabled = true;
    
    // Can't split after hitting
    canSplit = false;
    splitBtn.disabled = true;
    
    // Determine which hand to hit
    if (hasSplit && activeSplitHand) {
        // Hit the split hand
        const newCard = dealCard();
        splitCards.push(newCard);
        splitSum = calculateSum(splitCards);
        
        // Only add the new card to display
        await addNewCard(newCard, splitCardsElement);
        
        // Update split sum display
        splitSumElement.textContent = splitSum;
        
        // Check if split hand busts
        if (splitSum > 21) {
            splitResults.split = "bust";
            displayMessage('Split hand busts!', 1500);
            
            // Switch back to main hand if it's still in play
            if (splitResults.main === "") {
                activeSplitHand = false;
                updateCardDisplay(); // Update active hand highlighting
                displayMessage('Back to main hand', 1500);
            } else {
                // Both hands are done, move to dealer's turn
                await dealerPlay();
            }
        } else if (splitSum === 21) {
            // Automatically stand on 21
            splitResults.split = "stand";
            displayMessage('Split hand stands on 21!', 1500);
            
            // Switch back to main hand if it's still in play
            if (splitResults.main === "") {
                activeSplitHand = false;
                updateCardDisplay(); // Update active hand highlighting
                displayMessage('Back to main hand', 1500);
            } else {
                // Both hands are done, move to dealer's turn
                await dealerPlay();
            }
        }
    } else {
        // Hit the main hand
        const newCard = dealCard();
        playerCards.push(newCard);
        playerSum = calculateSum(playerCards);
        
        // Only add the new card to display (don't redraw all cards)
        await addNewCard(newCard, playerCardsElement);
        
        // Update player sum display
        playerSumElement.textContent = playerSum;
        
        // Check if player busts
        if (playerSum > 21) {
            if (hasSplit) {
                splitResults.main = "bust";
                displayMessage('Main hand busts!', 1500);
                
                // Switch to split hand if not played yet
                if (splitResults.split === "") {
                    activeSplitHand = true;
                    updateCardDisplay(); // Update active hand highlighting
                    displayMessage('Playing split hand', 1500);
                } else {
                    // Both hands are done, move to dealer's turn
                    await dealerPlay();
                }
            } else {
                // Regular bust (no split)
                endHand('bust');
            }
        } else if (playerSum === 21) {
            // Automatically stand on 21
            if (hasSplit) {
                splitResults.main = "stand";
                displayMessage('Main hand stands on 21!', 1500);
                
                // Switch to split hand if not played yet
                if (splitResults.split === "") {
                    activeSplitHand = true;
                    updateCardDisplay(); // Update active hand highlighting
                    displayMessage('Playing split hand', 1500);
                } else {
                    // Both hands are done, move to dealer's turn
                    await dealerPlay();
                }
            } else {
                // Regular stand on 21 (no split)
                stand();
            }
        }
    }
}

// Player stands (ends their turn)
async function stand() {
    if (!gameInProgress || dealingInProgress) return;
    
    if (hasSplit && !activeSplitHand) {
        // Standing on the main hand, switch to split hand
        splitResults.main = "stand";
        activeSplitHand = true;
        updateCardDisplay(); // Update active hand highlighting
        displayMessage('Playing split hand', 1500);
    } else if (hasSplit && activeSplitHand) {
        // Standing on the split hand, move to dealer's turn
        splitResults.split = "stand";
        dealersTurn = true;
        hitBtn.disabled = true;
        standBtn.disabled = true;
        doubleBtn.disabled = true;
        splitBtn.disabled = true;
        
        // Show dealer's hidden card
        await updateCardDisplay();
        
        // Dealer draws until 17 or higher
        dealerPlay();
    } else {
        // Regular stand (no split)
        dealersTurn = true;
        hitBtn.disabled = true;
        standBtn.disabled = true;
        doubleBtn.disabled = true;
        splitBtn.disabled = true;
        
        // Show dealer's hidden card by updating display
        await updateCardDisplay();
        
        // Dealer draws until 17 or higher
        dealerPlay();
    }
}

// Player doubles down
async function doubleDown() {
    if (!gameInProgress || !canDouble || playerChips < currentBet || dealingInProgress) return;
    
    if (hasSplit && activeSplitHand) {
        // Double down on split hand
        // Can't double if already hit split hand more than once
        if (splitCards.length > 1) return;
        
        // Double the bet
        playerChips -= currentBet;
        currentBet *= 2;
        
        // Add the additional chips to the bet array
        for (let i = 0; i < betChips.length; i++) {
            betChips.push(betChips[i]);
        }
        
        updateChipsDisplay();
        renderBetChips();
        
        // Deal one more card to split hand
        const newCard = dealCard();
        splitCards.push(newCard);
        splitSum = calculateSum(splitCards);
        
        // Add new card to split display
        await addNewCard(newCard, splitCardsElement);
        
        // Update split sum display
        splitSumElement.textContent = splitSum;
        
        // Mark split hand as complete
        if (splitSum > 21) {
            splitResults.split = "bust";
        } else {
            splitResults.split = "stand";
        }
        
        // Check if main hand is already played
        if (splitResults.main !== "") {
            // Both hands complete, move to dealer's turn
            dealersTurn = true;
            await updateCardDisplay();
            await dealerPlay();
        } else {
            // Switch back to main hand
            activeSplitHand = false;
            updateCardDisplay();
            displayMessage('Back to main hand', 1500);
        }
    } else {
        // Double down on main hand
        // Double the bet
        playerChips -= currentBet;
        currentBet *= 2;
        
        // Add the additional chips to the bet array
        for (let i = 0; i < betChips.length; i++) {
            betChips.push(betChips[i]);
        }
        
        updateChipsDisplay();
        renderBetChips();
        
        // Deal one more card to player then stand
        const newCard = dealCard();
        playerCards.push(newCard);
        playerSum = calculateSum(playerCards);
        
        // Only add the new card (don't redraw existing cards)
        await addNewCard(newCard, playerCardsElement);
        
        // Update player sum display
        playerSumElement.textContent = playerSum;
        
        if (hasSplit) {
            // Mark main hand as complete
            if (playerSum > 21) {
                splitResults.main = "bust";
                displayMessage('Main hand busts!', 1500);
            } else {
                splitResults.main = "stand";
            }
            
            // Switch to split hand if not played yet
            if (splitResults.split === "") {
                activeSplitHand = true;
                updateCardDisplay();
                displayMessage('Playing split hand', 1500);
            } else {
                // Both hands complete, move to dealer's turn
                dealersTurn = true;
                await updateCardDisplay();
                await dealerPlay();
            }
        } else {
            // Regular doubling (no split)
            if (playerSum > 21) {
                endHand('bust');
            } else {
                stand();
            }
        }
    }
}

// Player splits their hand
async function split() {
    if (!gameInProgress || !canSplit || dealingInProgress) return;
    
    // Can't split if already split
    if (hasSplit) return;
    
    // Take another bet
    playerChips -= currentBet;
    
    // Add the same chips to the bet array for the second hand
    betChips = [...betChips, ...betChips];
    
    updateChipsDisplay();
    renderBetChips();
    
    // Enable split UI
    hasSplit = true;
    splitAreaElement.style.display = 'block';
    
    // Move second card to split hand
    splitCards.push(playerCards.pop());
    
    // Add a card to each hand
    const newMainCard = dealCard();
    const newSplitCard = dealCard();
    
    playerCards.push(newMainCard);
    splitCards.push(newSplitCard);
    
    // Calculate new sums
    playerSum = calculateSum(playerCards);
    splitSum = calculateSum(splitCards);
    
    // Show split area and cards
    splitCardsElement.innerHTML = '';
    await displayCard(splitCards[0], splitCardsElement, false, 0);
    await addNewCard(splitCards[1], splitCardsElement);
    
    // Clear main hand and redisplay with new cards
    playerCardsElement.innerHTML = '';
    await displayCard(playerCards[0], playerCardsElement, false, 0);
    await addNewCard(playerCards[1], playerCardsElement);
    
    // Update sums display
    playerSumElement.textContent = playerSum;
    splitSumElement.textContent = splitSum;
    
    // Disable split button as it's already been used
    splitBtn.disabled = true;
    
    // Add highlighting for active hand
    playerCardsElement.parentElement.classList.add('active-hand');
    
    // Check if any hand has blackjack
    if (playerSum === 21) {
        splitResults.main = "blackjack";
        displayMessage('Blackjack on main hand!', 1500);
        
        // Switch to split hand
        activeSplitHand = true;
        updateCardDisplay();
        displayMessage('Playing split hand', 1500);
    }
    
    // Display appropriate message
    displayMessage('Hand split! Playing main hand first');
}

// Dealer's turn to play
async function dealerPlay() {
    dealingInProgress = true;
    
    // Show all dealer cards (reveal hidden card)
    dealersTurn = true;
    await updateCardDisplay();
    
    // Update dealer sum display
    dealerSumElement.textContent = dealerSum;
    
    // Dealer must hit on 16 or less, stand on 17 or more
    const dealDelay = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    while (dealerSum < 17) {
        await dealDelay(700); // Dramatic pause
        const newCard = dealCard();
        dealerCards.push(newCard);
        dealerSum = calculateSum(dealerCards);
        
        // Only add the new dealer card (don't redraw existing cards)
        await addNewCard(newCard, dealerCardsElement);
        
        // Update dealer sum display
        dealerSumElement.textContent = dealerSum;
    }
    
    dealingInProgress = false;
    
    if (hasSplit) {
        determineSplitWinners();
    } else {
        determineWinner();
    }
}

// Determine the winner of the hand
function determineWinner() {
    if (dealerSum > 21) {
        endHand('dealer-bust');
    } else if (dealerSum > playerSum) {
        endHand('dealer-win');
    } else if (dealerSum < playerSum) {
        endHand('player-win');
    } else {
        endHand('push');
    }
}

// Determine winners for split hands
function determineSplitWinners() {
    let totalWinnings = 0;
    let outcome = '';
    
    // Process main hand
    if (splitResults.main === "bust") {
        outcome = "Main hand: Bust (loss)\n";
    } else if (splitResults.main === "blackjack") {
        totalWinnings += currentBet * 2.5; // 3:2 payout for blackjack
        outcome = "Main hand: Blackjack! (3:2 payout)\n";
    } else if (dealerSum > 21) {
        totalWinnings += currentBet * 2; // Get back bet + winnings
        outcome = "Main hand: Dealer busts! (win)\n";
    } else if (dealerSum > playerSum) {
        outcome = "Main hand: Dealer wins\n";
    } else if (dealerSum < playerSum) {
        totalWinnings += currentBet * 2; // Get back bet + winnings
        outcome = "Main hand: Win!\n";
    } else {
        totalWinnings += currentBet; // Push - get back bet
        outcome = "Main hand: Push (tie)\n";
    }
    
    // Process split hand
    if (splitResults.split === "bust") {
        outcome += "Split hand: Bust (loss)";
    } else if (dealerSum > 21) {
        totalWinnings += currentBet * 2; // Get back bet + winnings
        outcome += "Split hand: Dealer busts! (win)";
    } else if (dealerSum > splitSum) {
        outcome += "Split hand: Dealer wins";
    } else if (dealerSum < splitSum) {
        totalWinnings += currentBet * 2; // Get back bet + winnings
        outcome += "Split hand: Win!";
    } else {
        totalWinnings += currentBet; // Push - get back bet
        outcome += "Split hand: Push (tie)";
    }
    
    // Add winnings to player's chips
    playerChips += totalWinnings;
    
    // Display results and reset for next hand
    displayMessage(outcome);
    updateChipsDisplay();
    resetForNextHand();
}

// End the current hand
function endHand(result) {
    gameInProgress = false;
    dealersTurn = true;
    
    switch (result) {
        case 'blackjack':
            displayMessage('Blackjack! You win 3:2');
            playerChips += currentBet * 2.5; // 3:2 payout for blackjack
            break;
        case 'bust':
            displayMessage('Bust! You lose');
            // Bet is already deducted
            break;
        case 'dealer-bust':
            displayMessage('Dealer busts! You win');
            playerChips += currentBet * 2; // Get back bet + winnings
            break;
        case 'dealer-win':
            displayMessage('Dealer wins!');
            // Bet is already deducted
            break;
        case 'player-win':
            displayMessage('You win!');
            playerChips += currentBet * 2; // Get back bet + winnings
            break;
        case 'push':
            displayMessage('Push! Bet returned');
            playerChips += currentBet; // Get back bet
            break;
    }
    
    resetForNextHand();
}

// Reset UI for next hand
function resetForNextHand() {
    gameInProgress = false; // Ensure game is not in progress
    
    // Clear the bet
    currentBet = 0;
    betChips = [];
    renderBetChips();
    
    // Disable game buttons
    hitBtn.disabled = true;
    standBtn.disabled = true;
    doubleBtn.disabled = true;
    splitBtn.disabled = true;
    
    // Reset split-related variables
    hasSplit = false;
    canSplit = false;
    activeSplitHand = false;
    
    // Hide split area
    splitAreaElement.style.display = 'none';
    
    // Update chips display (this will also enable bet buttons and deal button)
    updateChipsDisplay();
    
    // Explicitly enable deal button
    dealBtn.disabled = false;
    
    // Check if player is out of chips
    if (playerChips <= 0) {
        displayMessage('Game over! You\'re out of chips. Start a new game.');
        dealBtn.disabled = true;
    }
}

// Reduce bet - removes the most recent chip
function reduceBet() {
    if (currentBet <= 0 || gameInProgress || dealingInProgress) return;
    
    // Get the last chip
    const lastChipValue = betChips.pop();
    if (lastChipValue) {
        // Return value to player
        playerChips += lastChipValue;
        currentBet -= lastChipValue;
        
        // Update displays
        updateChipsDisplay();
        renderBetChips();
    }
}

// Clear all bets
function clearBet() {
    if (currentBet <= 0 || gameInProgress || dealingInProgress) return;
    
    // Return all bet value to player
    playerChips += currentBet;
    currentBet = 0;
    betChips = [];
    
    // Update displays
    updateChipsDisplay();
    renderBetChips();
}

// Add a bet
function placeBet(amount) {
    if (gameInProgress || dealingInProgress) return;
    if (amount > playerChips) {
        displayMessage(`Not enough chips! You have ${playerChips} chips.`);
        return;
    }
    
    // Add to current bet
    currentBet += amount;
    playerChips -= amount;
    
    // Add to chips array
    betChips.push(amount);
    
    // Add visual chip to bet area
    addChipToBetArea(amount);
    
    // Update displays
    updateChipsDisplay();
}

// Start a new game (reset everything)
function newGame() {
    initGame();
    resetForNextHand();
}

// Event listeners
dealBtn.addEventListener('click', startHand);
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);
doubleBtn.addEventListener('click', doubleDown);
splitBtn.addEventListener('click', split);
newGameBtn.addEventListener('click', newGame);
reduceBetBtn.addEventListener('click', reduceBet);
clearBetBtn.addEventListener('click', clearBet);

betButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        placeBet(parseInt(btn.dataset.bet));
    });
});

// Initialize the game
initGame();