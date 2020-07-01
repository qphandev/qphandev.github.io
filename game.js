const TILE_SIZE = 64;
let ctx = document.getElementById("display").getContext("2d");
let shipSprite = new Image();
let spaceSprite = new Image();
let obstacleSprite = new Image();
let scrollX;
let player;
let map;
let score;
let scoreCounter = document.getElementById("scoreCounter");
let numeralStyleButton = document.getElementById("numeralStyleButton");
ctx.fillStyle = "black";
shipSprite.src = "assets/ship.png";
spaceSprite.src = "assets/space.png";
obstacleSprite.src = "assets/tofu.png";
let numeralStyle = "Roman"; // Roman
let gameRunning = false;

// Load the music

let music = document.createElement("audio");
music.preload = "auto";
music.src = "assets/deja-vu.mp3";
music.load();
music.volume = 1.00;

let deathAudio = document.createElement("audio");
deathAudio.preload = "auto";
deathAudio.src = "assets/death.wav";
deathAudio.load();
deathAudio.volume = 1.00;

function toRomanNumerals(n) {
	if(n < 0)
		return NaN;
	else if(n == 0)
		return "Nullus";
	else if(n > 999999)
		return "Let's just say that your score is really big.";
	let digits = String(+n).split("");
	let romanKey = ["","C","CC","CCC","CD","D","DC","DCC","DCCC","CM",
        			"","X","XX","XXX","XL","L","LX","LXX","LXXX","XC",
        			"","I","II","III","IV","V","VI","VII","VIII","IX"];
	let romanNumerals = "";
	let i = 3;
	while(i--)
		romanNumerals = (romanKey[+digits.pop() + (i * 10)] || "") + romanNumerals;
	return Array(+digits.join("") + 1).join("M") + romanNumerals;
}

function toJapaneseNumerals(n) {
	if(n < 0)
		return NaN;
	else if(n > 99999999)
		return "Let's just say that your score is really, really, ridiculously big,";
	let onesMatrix = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
	let result;
	if(n >= 0 && n <= 9)
		result = onesMatrix[n];
	else if(n >= 10 && n <= 19)
		result = "十" + onesMatrix[n % 10];
	else if(n >= 20 && n <= 99)
		result = onesMatrix[Math.floor(n / 10)] + "十" + onesMatrix[n % 10];
	else if(n >= 100 && n <= 199)
		result = "百" + toJapaneseNumerals(n - 100);
	else if(n >= 200 && n <= 999)
		result = onesMatrix[Math.floor(n / 100)]  + "百" + toJapaneseNumerals(n % 100);
	else if(n >= 1000 && n <= 9999)
		result = onesMatrix[Math.floor(n / 1000)]  + "千" + toJapaneseNumerals(n % 1000); // 一千 is correct, not 千, unlike lower numbers
	else
		result = toJapaneseNumerals(Math.floor(n / 10000)) + "万" + toJapaneseNumerals(n % 10000);
    // Strip trailing zeroes
    if(result[result.length - 1] == "零")
        result = result.slice(0, -1);
	return result;
}

function toNumerals(n) {
	if(numeralStyle == "Roman")
		return toRomanNumerals(n);
	else if(numeralStyle == "Japanese")
		return toJapaneseNumerals(n);
}

function changeNumeralStyle() {
	if(numeralStyle == "Roman")
		numeralStyle = "Japanese";
	else if(numeralStyle == "Japanese")
		numeralStyle = "Roman";
	scoreCounter.innerHTML = toNumerals(score);
	numeralStyleButton.innerHTML = "Numeral Style (" + numeralStyle + ")";
}

function generateColumn() {
	let column = [];
	for(let i = 0; i < 10; i++) {
		column.push(Math.random() > 0.8);
	}
	// Check to make sure that there aren't too many obstacles, preventing the player from making it through
	let obstacleCount = 0;
	column.forEach(function(tile) {
		if(tile == true)
			obstacleCount++;
	});
	if(obstacleCount > 6)
		return generateColumn(); // Generate a new column
	return column;
}

function generateEmptyColumn() {
	let column = [];
	for(let i = 0; i < 10; i++)
		column.push(false);
	return column;
}

function render() {
	ctx.fillRect(0,0,640,640);
	for(let x = 0; x < 11; x++) {
		for(let y = 0; y < 10; y++) {
			if(map[x][y] == true)
                ctx.drawImage(obstacleSprite, x * TILE_SIZE - scrollX, y * TILE_SIZE);
			else
                ctx.drawImage(spaceSprite, x * TILE_SIZE - scrollX, y * TILE_SIZE);
		}
	}

	ctx.drawImage(shipSprite, player.x, player.y);
}

function collide() {
	music.pause();
	deathAudio.play();
	alert("You are already dead!");
	alert("What?!");
}

function tick() {
    render();
	scrollX += 2;
	if(scrollX >= TILE_SIZE) {
		map.shift();
		map.push(generateColumn());
		scrollX = 0;
		score++;
		scoreCounter.innerHTML = toNumerals(score);
	}
	// Move player
	player.x += player.vx;
	player.y += player.vy;
	// Check player for world bounds
	player.x = player.x >= 0 ? player.x : 0;
    player.x = player.x <= 576 ? player.x : 576; // The size of the screen, minus the size of the sprite
    player.y = player.y >= 0 ? player.y : 0;
    player.y = player.y <= 576 ? player.y : 576; // The size of the screen, minus the size of the sprite
	// Check for collision, first calculate player position in the world by adding scroll offset
	let tileX = Math.round((player.x + scrollX) / 64);
	let tileY = Math.round(player.y / 64);
	if(map[tileX][tileY] == true) {
        collide();
        gameRunning = false;
        return;
	}
    // Advance to the next frame
	window.requestAnimationFrame(tick);
}

window.onkeydown = function (key) {
	switch(key.keyCode) {
		case 38:
			player.vy = -4;
			break;
		case 40:
			player.vy = 4;
			break;
		case 37:
			player.vx = -4;
			break;
		case 39:
			player.vx = 4;
			break;
	}
};

window.onkeyup = function (key) {
    switch(key.keyCode) {
        case 38:
            player.vy = 0;
            break;
        case 40:
            player.vy = 0;
        case 37:
            player.vx = 0;
            break;
        case 39:
            player.vx = 0;
            break;
    }
};

function startGame() {
	if(!gameRunning) {
        map = [];
        for(let x = 0; x < 11; x++)
            map.push(generateEmptyColumn());
        player = { x: 320, y: 320, vx: 0, vy: 0};
        scrollX = 0;
        score = 0;
        scoreCounter.innerHTML = "";
        music.addEventListener('ended', function() { // Make the music loop
            this.currentTime = 0;
            this.play();
        }, false);
        music.play();
        gameRunning = true;
        tick();
	}
}