document.addEventListener('keypress', playerMove);

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

function renderPlayer() {
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
}

function getGameState() {
    fetch('http://127.0.0.1:5000/gamestate')
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

function playerMove(e) {
    url = '/move/?player=' + self.name + "&move=" + e.key
    if (e.key == 'w' || e.key == 's' || e.key == 'a' || e.key == 'd')
        fetch(url);
}

function gameLoop(n) {
    self.name = n;
    player = document.getElementById(self.name);
    setInterval(getGameState, 100);
}
