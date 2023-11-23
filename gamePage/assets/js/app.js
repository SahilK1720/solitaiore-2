let lastCard = 51;
let ace = 0;
let moves = 0;
let cardsDealt = 0;
let seconds = 0;
let handsPlayed = 0;
let handsWon = 0;
let dropArray = [];
let toDeal = [];
let timer;
let newCardBlock;
let newCardFlipBlock;

function clearGlobal(){
	clearInterval(timer);
	lastCard = 51;
	ace = 0;
	moves = 0;
	cardsDealt = 0;
	seconds = 0;
	dropArray = [];
	toDeal = [];
}

const backgroundSound = new Audio("../../../assets/audio/solitaire.mp3");
    backgroundSound.play();
    backgroundSound.loop = true;

// Sets up the key listener for the 'D' key to deal again
document.addEventListener('keydown', function(event) {
	if (event.code == 'KeyD') {
		gameStart();
	}
});

// A div element to serve as the main container for the game
let container = document.createElement('div');
container.id = 'container';
document.body.prepend(container);

// A div to serve as the game area where cards will be displayed
let gameArea = document.createElement('div');
gameArea.id = 'gameArea';
container.append(gameArea);

// A div to serve as the score area to display game statistics
let scoreArea = document.createElement('div');
scoreArea.id = 'scoreArea';
container.append(scoreArea);

// A div to hold the time score block within the score area
let scoreBlockTime = document.createElement('div');
scoreBlockTime.className = 'scoreBlock';
scoreArea.append(scoreBlockTime);

// A span element to display the time within the score block
let scoreValueTime = document.createElement('span');
scoreValueTime.className = 'scoreValue';
scoreValueTime.innerText = '0:00';
scoreBlockTime.append(scoreValueTime);

// A div to hold the moves score block within the score area
let scoreBlockMoves = document.createElement('div');
scoreBlockMoves.className = 'scoreBlock';
scoreArea.append(scoreBlockMoves);

// A span element to display the number of moves within the score block
let scoreValueMoves = document.createElement('span');
scoreValueMoves.className = 'scoreValue';
scoreValueMoves.innerText = moves + 'moves';
scoreBlockMoves.append(scoreValueMoves);

gameStart();

// Function to start or restart the game
function gameStart(){
	clearGlobal();
	shuffleCards(1, cards);
	handsPlayed++;

	// Distributes the remaining cards to deal after the initial layout is set
	for(let i = 28; i < cards.length; i++){
		toDeal[i] = cards[i];
	}
	gameArea.innerHTML = '';

	let gameAreaSpan = document.createElement('span');
	gameAreaSpan.id = 'gameAreaSpan';
	gameAreaSpan.innerText = 'Press D to deal again';
	gameArea.append(gameAreaSpan);
	
	// A new card block for dealing new cards when clicked
	newCardBlock = document.createElement('div');
	newCardBlock.className = 'cardBlockNewClick cardHidden';
	gameArea.append(newCardBlock);

	// A flip block for the new cards that will be dealt
	newCardFlipBlock = document.createElement('div');
	newCardFlipBlock.className = 'cardBlockFlip';
	gameArea.append(newCardFlipBlock);

	// Click event listener to the new card block for dealing cards
	newCardBlock.addEventListener('click', function(){
		dealCards(0, newCardFlipBlock);
		increaseMoves();
	});

	let blankBlock = document.createElement('div');
	blankBlock.className = 'blankBlock';
	gameArea.append(blankBlock);

	// foundation blocks/ace blocks for dropping aces
	for(let i = 0; i < 4; i++){
		let aceBlock = document.createElement('div');
		aceBlock.className = 'cardBlockAce';
		aceBlock.addEventListener('drop', function(event){
			aceDrop(event);
		});
		aceBlock.addEventListener('dragover', function(event){
			allowDrop(event);
		});
		gameArea.append(aceBlock);

	}

	let divider = document.createElement('div');
	gameArea.append(divider);

	// tableau blocks for the main game interaction
	for(let i = 0; i < 7; i++){
		let playBlock = document.createElement('div');
		playBlock.className = 'cardBlock';
		playBlock.addEventListener('drop', function(event){
			drop(event);
		});
		playBlock.addEventListener('dragover', function(event){
			allowDrop(event);
		});
		gameArea.append(playBlock);

		dealCards(i, playBlock);
	}

	// Updates the score area with the initial time and move values
	scoreValueTime.innerText = '0:00';
	scoreValueMoves.innerText = moves + ' moves';
}

// Prevents the default handling of the event to allow for a drop operation
function allowDrop(ev) {
	ev.preventDefault();
}

// Function to handle the drag start event
function drag(ev) {
	dropArray = [];
	ev.dataTransfer.setData("card", ev.target.id);
	dropArray.push(ev.target.id);
	let cardBlockParent = ev.target.closest('.cardBlock');

	// If there is a parent card block, proceeds to check for other cards stacked with this one
	if(cardBlockParent != null){
		let cardsEl = cardBlockParent.getElementsByClassName('card');

		// Finds the position of the dragged element within its parent's children
		let cardPos = Array.from(ev.target.parentNode.children).indexOf(ev.target);

		// Adds the ids of all cards that are positioned after the dragged card to the drop array, to drag all cards stacked below it
		for(let i = cardPos + 1; i < cardsEl.length; i++){
			dropArray.push(cardsEl[i].id);
		}
	}
}

// Function to handle the event when a card is dropped onto an ace foundation pile
function aceDrop(ev){
	let data = ev.dataTransfer.getData("card");
	let element = document.getElementById(data);
	let parent = element.closest('.cardBlock');
	if(document.getElementById(data).hasAttribute('deal-card')){
		element.removeAttribute('deal-card');
		let cardId = element.getAttribute('data-id');
		toDeal[cardId] = null;
	}
	// Checks if the target of the drop is not an ace pile
	if(ev.target.className != 'cardBlockAce'){
		let cardBlockParent = ev.target.closest('.cardBlockAce');
		let currentFace = element.getAttribute('data-face');
		let currentSuit = element.getAttribute('data-suit');
		let cardsEl = cardBlockParent.getElementsByClassName('card');
		let dropSuit = cardsEl[cardsEl.length - 1].getAttribute('data-suit');

		// If the suit of the dragged card matches the suit of the ace pile
		if(currentSuit == dropSuit){
			let currentFacePos = cardPosition(currentFace, 1) - 1;
			let dropFacePos = cardPosition(cardsEl[cardsEl.length - 1].getAttribute('data-face'), 1);

			// If the dragged card follows the last card in the ace pile, i.e. checks if it is in the ascending order
			if(currentFacePos == dropFacePos){
				element.className = 'card';
				cardBlockParent.append(element);
				increaseMoves();

				// If the dragged card had a parent, reveals the next card and makes it draggable
				if(parent !== null){
					let cardCount = parent.getElementsByClassName('card');
					if(cardCount.length > 0){
						cardCount[cardCount.length - 1].classList.remove('cardHidden');
						cardCount[cardCount.length - 1].setAttribute('draggable', true);
					}
				}
				checkWin();
			}
		}
	}else{
		// If the dropped card is an Ace and it's dropped on an empty ace pile
		if(element.getAttribute('data-face') == 'A'){
			element.className = 'card';
			ev.target.appendChild(element);
			increaseMoves();
			if(parent != null){
				let cardCount = parent.getElementsByClassName('card');
				if(cardCount.length > 0){
					cardCount[cardCount.length - 1].classList.remove('cardHidden');
					cardCount[cardCount.length - 1].setAttribute('draggable', true);
				}
			}
		}
	}
}

// Function to handle the event when a card is dropped onto a tableau pile
function drop(ev) {
	for(let i = 0; i < dropArray.length; i++){
		let data = dropArray[i];
		let element = document.getElementById(data);
		let parent = element.closest('.cardBlock');
		let face = element.getAttribute('data-face');

		// Checks if the card was a dealt card and update the toDeal array accordingly
		if(element.hasAttribute('deal-card')){
			element.removeAttribute('deal-card');
			let cardId = element.getAttribute('data-id');
			toDeal[cardId] = null;
		}
		if(ev.target.className == 'cardBlock' && face == 'K'){
			element.className = 'card topClass' + ev.target.getElementsByClassName('card').length + 1;
			ev.target.appendChild(element);
			if(parent != null){
				let cardCount = parent.getElementsByClassName('card');
				if(cardCount.length > 0){
					cardCount[cardCount.length - 1].classList.remove('cardHidden');
					cardCount[cardCount.length - 1].setAttribute('draggable', true);
				}
			}
		}
		let cardBlockParent = ev.target.closest('.cardBlock');
		let currentSuit = element.getAttribute('data-suit');
		let cardsEl = cardBlockParent.getElementsByClassName('card');
		let dropSuit = (cardsEl[cardsEl.length - 1])? cardsEl[cardsEl.length - 1].getAttribute('data-suit') : 'blank';

		// Checks if the suits are alternating colors and the faces are in sequential order
		if(((currentSuit == 'heart' || currentSuit == 'diamond') && (dropSuit == 'spade' || dropSuit == 'clubs')) || ((currentSuit == 'spade' || currentSuit == 'clubs') && (dropSuit == 'heart' || dropSuit == 'diamond'))){
			let currentFacePos = cardPosition(face, 0) + 1;
			let dropFacePos = cardPosition(cardsEl[cardsEl.length - 1].getAttribute('data-face'), 0);
			 // If the dragged card is one less than the drop target card, allow the drop, i.e. in descending order
			if(currentFacePos == dropFacePos){
				element.setAttribute('temp', true);
				element.className = 'card topClass' + (ev.target.closest('.cardBlock').getElementsByClassName('card').length + 1);
				cardBlockParent.append(element);

				if(parent != null){
					let cardCount = parent.getElementsByClassName('card');
					if(cardCount.length > 0){
						cardCount[cardCount.length - 1].classList.remove('cardHidden');
						cardCount[cardCount.length - 1].setAttribute('draggable', true);
					}
				}
			}
		}

		ev.preventDefault();
	}

	increaseMoves();
}

function checkWin(){
	let aceBlock = document.getElementsByClassName('cardBlockAce');
	for(let i = 0; i < aceBlock.length; i++){
		let card = aceBlock[i].getElementsByClassName('card');
		if(card.length == 13){
			ace++;
		}else{
			return ace = 0;
		}
	}

	if(ace == 4){
		return gameWin();
	}
	
}

function gameWin(){
	clearInterval(timer);
	handsWon++;

	var winDetails = {
        moves: moves,
        handsWon: handsWon,
		handsPlayed: handsPlayed
    };

    localStorage.setItem("winDetails", JSON.stringify(winDetails));  
	
	window.location.href = "../../../resultPage/result.html";

}

function increaseMoves(){
	moves++;
	document.getElementsByClassName('scoreValue')[1].innerText = moves + ' moves';
	if(moves == 1){
		startTimer();
	}
}

function timerConvert(ms) {
	let minutes = Math.floor(ms / 60000);
	let seconds = Math.floor((ms % 60000) / 1000);
	return (seconds == 60)? (minutes + 1) + ':00' : minutes + ':' + ((seconds < 10)? '0' : '') + seconds;
}

function startTimer(){
	timer = setInterval(function() {
		seconds = seconds + 1000;
		document.getElementsByClassName('scoreValue')[0].innerText = timerConvert(seconds);
	}, 1000);
}

// Function to check if all cards have been dealt
function checkDealt(count){
	if(toDeal[cardsDealt] == null){
		cardsDealt++;
		
		// If we've dealt all cards, reset the new card blocks to show that no cards are left to deal
		if(cardsDealt > lastCard){
			newCardFlipBlock.innerHTML = '';
			newCardBlock.innerHTML = '';
			newCardBlock.className = 'cardBlockNewClick cardHidden';
			cardsDealt = 28; // Resets cardsDealt to the start of the toDeal array
		}

		count++;
		if(count == 30){
			lastCard = 0;
			return false;
		}

		checkDealt(count);
	}
}

// Function to deal cards from the deck to the play area
function dealCards(count, playBlock){
	if(cardsDealt > lastCard){
		newCardFlipBlock.innerHTML = '';
		newCardBlock.innerHTML = '';
		newCardBlock.className = 'cardBlockNewClick cardHidden';
		cardsDealt = 28;
	}

	// Determines whether to deal from the main deck or the remaining cards
	let deal = (cardsDealt > 27)? toDeal : cards;

	// If we are dealing from the remaining cards, check if all cards have been dealt
	if(cardsDealt > 27){
		checkDealt(1);
	}

	// If there are still cards left to be dealt
	if(lastCard != 0){
		for(let i = 1; i <= (count + 1); i++){
			let viewClass = (cardsDealt < 28)? ' cardHidden' : '';
			let colourClass = (deal[cardsDealt].suit == 'heart' || deal[cardsDealt].suit == 'diamond')? ' red' : ' black';
			let topClass = (i > 1)? ' topClass' + i : '';
			let card = document.createElement('div');
			card.className = 'card' + topClass + viewClass;
			card.id = deal[cardsDealt].suit + deal[cardsDealt].face;
			card.setAttribute('data-id', cardsDealt);
			card.setAttribute('data-face', deal[cardsDealt].face);
			card.setAttribute('data-suit', deal[cardsDealt].suit);
			if(cardsDealt > 27){
				card.setAttribute('draggable', true);
				card.setAttribute('deal-card', true);
			}
			card.addEventListener('dragstart', function(event){
				drag(event);
			});
			playBlock.append(card);

			// Adds the card's face and suit to the top of the card for display
			let numberTop = document.createElement('div');
			numberTop.className = 'number-top' + colourClass;
			numberTop.innerText = deal[cardsDealt].face;
			card.append(numberTop);

			let suitTop = document.createElement('div');
			suitTop.className = 'suit-top';
			card.append(suitTop);

			let suitTopEl = document.createElement('div');
			suitTopEl.className = deal[cardsDealt].suit;
			suitTop.append(suitTopEl);

			// Adds the central suit symbol or face image for face cards
			let suitCentre = document.createElement('div');
			suitCentre.className = 'suit-centre';
			card.append(suitCentre);

			// If the card is not a face card, adds the appropriate number of suit symbols
			if(deal[cardsDealt].face != 'J' && deal[cardsDealt].face != 'Q' && deal[cardsDealt].face != 'K' && deal[cardsDealt].face != 'A'){
				for(let k = 0; k < parseInt(deal[cardsDealt].face); k++){
					let suitEl = document.createElement('div');
					suitEl.className = deal[cardsDealt].suit + ' ' + deal[cardsDealt].suitClass + '-' + suitCentreClasses[k];
					suitCentre.append(suitEl);
				}
			}
			// For face cards, adds a single large suit letter
			else{
				let suitEl = document.createElement('div');
				suitEl.className = deal[cardsDealt].suitClass + ' ' + deal[cardsDealt].suitCentreClass;
				suitEl.innerText = deal[cardsDealt].face;
				suitCentre.append(suitEl);
			}


			// Adds the card's face and suit to the bottom of the card for display
			let numberBottom = document.createElement('div');
			numberBottom.className = 'number-bottom';
			numberBottom.innerText = deal[cardsDealt].face;
			card.append(numberBottom);

			let suitBottom = document.createElement('div');
			suitBottom.className = 'suit-bottom';
			card.append(suitBottom);

			let suitBottomEl = document.createElement('div');
			suitBottomEl.className = deal[cardsDealt].suit;
			suitBottom.append(suitBottomEl);

			cardsDealt++;

			/* Revealing the last card of the pile(face-up) and making it draggable */
			if(cardsDealt == 28){
				let cardBlocks = document.getElementsByClassName('cardBlock');
				for(let i = 0; i < cardBlocks.length; i++){
					let cardsEl = cardBlocks[i].getElementsByClassName('card');
					cardsEl[cardsEl.length - 1].classList.remove('cardHidden');
					cardsEl[cardsEl.length - 1].setAttribute('draggable', true);
				}
			}
			
			/* A final update to the lastCard value based on the current game state and then using that information to potentially signal to the user interface that no more cards are available to be dealt.*/
			for(let j = 0; j < cards.length; j++){
				if(toDeal[j] != null){
					lastCard = j;
				}
			}

			if(cardsDealt > lastCard){
				newCardBlock.className = 'cardBlockNewClick';
				let span = document.createElement('span');
				span.className = 'ncbSpan';
				span.innerText = '0';
				newCardBlock.append(span);
			}
		}
	}else{
		newCardBlock.innerHTML = '';
		newCardBlock.className = 'cardBlockNewClick';
		let span = document.createElement('span');
		span.className = 'ncbSpanClose';
		span.innerText = 'X';
		newCardBlock.append(span);
		newCardBlock.removeEventListener('click', function(){
			dealCards(0, newCardFlipBlock);
			increaseMoves();
		});
	}
}
