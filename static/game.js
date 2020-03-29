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
        newOpponent.className = 'opponent';
        newOpponent.id = name;
        document.getElementById('arena').appendChild(newOpponent);
        op = document.getElementById(name);
    }
    // render the opponent in the arena
    renderOpponent(op, name, obj);

    var bombDeploy = obj[name].bomb.deployed;
    var explode = obj[name].bomb.explode;
    if (bombDeploy == true && explode == false) {
        var bx = obj[name].bomb.x;
        var by = obj[name].bomb.y;

        var bomb_id = name + 'bomb' + bx + by;
        var bomb = document.getElementById(bomb_id)
        if (bomb == null && obj[name].bomb.explode == false) {
            plantBomb(name, bx, by);
        }
    } 
    
    if (bombDeploy == true && explode == true) {
        var bx = obj[name].bomb.x;
        var by = obj[name].bomb.y;
        var bomb_id = name + 'bomb' + bx + by;
        var bomb = document.getElementById(bomb_id)
        if (bomb) {
            explosion(bomb, bx, by);
        } 
    }
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

                  var bombDeploy = obj[key].bomb.deployed;
                  if (bombDeploy == true) {
                      var bx = obj[key].bomb.x;
                      var by = obj[key].bomb.y;

                      var bomb_id = key + 'bomb' + bx + by;
                      var bomb = document.getElementById(bomb_id)
                      if (bomb == null) {
                        console.log(bx, by);
                        plantBomb(key, bx, by);
                      } else if (obj[key].bomb.explode){
                        explosion(bomb, bx, by);
                      }
                  }
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

function playerPlantsBomb(key) {
    url = '/plantbomb/?player=' + self.name + "&bx=" + self.position.x + "&by=" + self.position.y 
    fetch(url);
}

function plantBomb(name, x, y) {
	bomb = document.createElement('div');
    // bomb.className = 'bomb fas fa-bomb';
	bomb.className = 'bomb';
    bomb.id = name + 'bomb' + x + y;
    bomb.style.gridColumnStart = x ;
    bomb.style.gridRowStart = y;
    document.getElementById('arena').appendChild(bomb);
}

function explosion(obj, x, y) {
    console.log(x, y);

    explodeInX = document.createElement('div');
    explodeInY = document.createElement('div');

    explodeInX.className = 'explosionY';
    explodeInY.className = 'explosionX';

    explodeInX.style.gridColumnStart = x;
    explodeInY.style.gridRowStart = y;

    document.getElementById('arena').appendChild(explodeInY);
    document.getElementById('arena').appendChild(explodeInX);
    obj.remove();

    setTimeout(() => { 
        var e = document.getElementsByClassName('explosionY');
        while(e.length > 0){
            e[0].parentNode.removeChild(e[0]);
        }

        e = document.getElementsByClassName('explosionX');
        while(e.length > 0){
            e[0].parentNode.removeChild(e[0]);
        }
    }, 500);
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
		playerPlantsBomb();
		return;
	}

    if (e.key == 'w' || e.key == 's' || e.key == 'a' || e.key == 'd' || e.key == 'p') {
		registerMove(e.key);
		return;
	}
}

function gameLoop(n) {
    self.name = n;

    document.addEventListener('keypress', keyDetected);
    setInterval(getGameState, 250);
}
