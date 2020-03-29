#!/usr/bin/python3
from flask import Flask, jsonify, request
from random import randint
import logging
import threading

log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

app = Flask(__name__)

BOARD_SIZE_X = 20
BOARD_SIZE_Y = 20

game_state = {
    "board_size" : {
        "x" : BOARD_SIZE_X,
        "y" : BOARD_SIZE_Y
    },
    "players" : {
    }
}

def initPlayer(player):
    player_state = {
        'position' : {
            'x': randint(0, BOARD_SIZE_X),
            'y': randint(0, BOARD_SIZE_Y)
        },
        "bomb" : {
            'deployed' : False,
            'x' : '',
            'y' : '',
            'explode' : False
        }
    }
    
    game_state['players'][player] = player_state

def readFile(file):
    # Open a file: file
    file = open(file,mode='r')
    content = file.read()
    file.close()
    return content

@app.route('/game.css')
def gameCss():
    return readFile('game/game.css')

@app.route('/game.js')
def gameJs():
    return readFile('game/game.js')

@app.route('/', methods = ['POST', 'GET'])
def serveIndex():
    return readFile('game/game.html')

@app.route('/addplayer/', methods = ['POST', 'GET'])
def addPlayer():
    player = request.args.get('player')
    initPlayer(player)
    return jsonify(game_state)

@app.route('/gamestate/')
def gameState():
    return jsonify(game_state)

@app.route('/move/', methods = ['POST', 'GET'])
def registerMove():
    player = request.args.get('player')
    move = request.args.get('move')
    dx, dy = 0, 0

    if (move == 'w'):
        dy = -1
    elif (move == 's'):
        dy = 1
    elif (move == 'd'):
        dx = 1
    elif (move == 'a'):
        dx = -1
    else:
        return
    
    game_state['players'][player]['position']['x'] += dx
    game_state['players'][player]['position']['y'] += dy

    return jsonify(game_state)

def bombTimeout(*args):
    player = args[0]
    game_state['players'][player]['bomb']['explode'] = True


@app.route('/plantbomb/', methods = ['POST', 'GET'])
def plantBomb():
    player = request.args.get('player')
    bx = request.args.get('bx')
    by = request.args.get('by')

    game_state['players'][player]['bomb']['x'] = bx
    game_state['players'][player]['bomb']['y'] = by

    game_state['players'][player]['bomb']['deployed'] = True
    game_state['players'][player]['bomb']['explode'] = False

    bombTicking = threading.Timer(2, bombTimeout, (player,))
    bombTicking.start()

    return jsonify(game_state)

if __name__ == '__main__':
    app.run()