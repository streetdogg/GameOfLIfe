function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function renderPlayer() {
    player = document.getElementById(self.name);
    player.style.gridColumn = self.position.x + "/" + (self.position.x + 1);
    player.style.gridRow = self.position.y + "/" + (self.position.y + 1);
}

function renderOpponent(opponent, name, obj) {
    opponent.style.gridColumn = obj[name].position.x + "/" + (obj[name].position.x + 1);
    opponent.style.gridRow = obj[name].position.y + "/" + (obj[name].position.y + 1);
}

function moveHor(delta) {
    if (self.position.x + delta > 20 || self.position.x + delta < 0)
        return;

    self.position.x += delta;
}

function moveVer(delta) {
    if (self.position.y + delta > 20 || self.position.y + delta < 0)
        return;

    self.position.y += delta;
}

function opponentState(name, obj) {
    var op = document.getElementById(name);

    // Add new opponent
    if(op == null){
        newOpponent = document.createElement('div');
        newOpponent.className = 'opponent fas fa-angry';
        newOpponent.id = name;
        document.getElementById('arena').appendChild(newOpponent);
        op = document.getElementById(name);
    }

    // render the opponent in the arena
    renderOpponent(op, name, obj);
}

function getGameState() {
    fetch('/gamestate')
    .then((response) => {
        return response.json()
    })
    .then((data) => {
        obj = data.players
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              if (key == self.name) {
                  self.position.x = obj[key].position.x;
                  self.position.y = obj[key].position.y;
                  console.log(self.position)
                  renderPlayer();
              }
            }

            opponentState(key, obj);
        }
    })
}

var self = {
    name: '',
    position : {
        x : 0,
        y : 0
    }
}

function plantBomb() {
	bomb = document.createElement('div');
    bomb.className = 'bomb fas fa-bomb';
	// bomb.className = 'bomb';
    bomb.id = self.name + 'bomb';
    bomb.style.gridColumn = self.position.x + "/" + (self.position.x + 1);
    bomb.style.gridRow = self.position.y + "/" + (self.position.y + 1);
    document.getElementById('arena').appendChild(bomb);

}

function registerMove(key) {
    url = '/move/?player=' + self.name + "&move=" + key
    if (key == 'w' || key == 's' || key == 'a' || key == 'd')
        fetch(url);
}

function keyDetected(e) {
    if (self.name == null)
		return

	if (e.key == 'p') {
		plantBomb();
		return;
	}

    if (e.key == 'w' || e.key == 's' || e.key == 'a' || e.key == 'd') {
		registerMove(e.key);
		return;
	}
}

function gameLoop(n) {
    self.name = n;

    document.addEventListener('keypress', keyDetected);
    setInterval(getGameState, 200);
}
