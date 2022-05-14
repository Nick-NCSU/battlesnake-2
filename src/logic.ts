import { InfoResponse, GameState, MoveResponse, Game, Coord } from "./types.d"
import { Board } from "./Board"
import { TileType } from "./types"

export function info(): InfoResponse {
    console.log("INFO")
    const response: InfoResponse = {
        apiversion: "1",
        author: "",
        color: "#888888",
        head: "default",
        tail: "default"
    }
    return response
}

export function start(gameState: GameState): void {
    console.log(`${gameState.game.id} START`)
}

export function end(gameState: GameState): void {
    console.log(`${gameState.game.id} END\n`)
}

export function move(gameState: GameState): MoveResponse {
    // Create the board
    const board:Board = new Board(gameState.board.width, gameState.board.height);

    // Add all snakes to the board
    for(const snake of gameState.board.snakes) {
        for(const coord of snake.body) {
            board.setType(coord, TileType.BODY);
            board.setId(coord, snake.id);
        }
        board.setType(snake.head, TileType.HEAD);
        board.setType(snake.body[snake.body.length - 1], TileType.TAIL);
    }

    // Add all food to the board
    for(const food of gameState.board.food) {
        board.setType(food, TileType.FOOD);
    }

    // Add all hazards to the board
    for(const hazard of gameState.board.hazards) {
        board.setHazard(hazard, true);
    }

    console.log(board.toString());
    
    const myHead:Coord = gameState.you.head;
    // Finds all valid moves
    let validMoves = {
        up: board.validMove({ x: myHead.x, y: myHead.y + 1 }),
        down: board.validMove({ x: myHead.x, y: myHead.y - 1 }),
        left: board.validMove({ x: myHead.x - 1, y: myHead.y }),
        right: board.validMove({ x: myHead.x + 1, y: myHead.y })
    }
    // Initializes weights for each direction
    let moveWeights = {
        up: 0,
        down: 0,
        left: 0,
        right: 0
    }

    for(const neighbor of board.getNeighbors(myHead)) {
        // If the neighbor is a tail, subtract a weight of 100 if the head is adjacent to food
        if(neighbor.type === TileType.TAIL) {
            if(board.getNeighbors(board.findHead(neighbor.id!)).filter(tile => tile.type === TileType.FOOD).length !== 0) {
                moveWeights[Board.getDirection(myHead, neighbor.coord) as keyof typeof moveWeights] -= 100;
            }
        }
        // If the neighbor is a valid move
        if(board.validMove(neighbor.coord)) {
            // Check all neighbors of the neighbor
            for(const neighbor2 of board.getNeighbors(neighbor.coord)) {
                // If the neighbor2 is a head and our snake is bigger, add a weight of 20.
                // Otherwise subtract a weight of 500.
                if(neighbor2.type === TileType.HEAD && neighbor2.id !== gameState.you.id) {
                    moveWeights[Board.getDirection(myHead, neighbor.coord) as keyof typeof moveWeights] += gameState.you.length > board.findSnake(neighbor2.id!).length ? 20 : -500;
                }
            }
        }
    }

    // Add weight for each food
    for (const food of gameState.board.food) {
        if (food.x < myHead.x) {
            moveWeights.left++;
        } else if (food.x > myHead.x) {
            moveWeights.right++;
        } else if (food.y < myHead.y) {
            moveWeights.down++;
        } else if (food.y > myHead.y) {
            moveWeights.up++;
        }
    }

    // Filter out invalid moves
    for(const direction of Object.keys(validMoves)) {
        if(!validMoves[direction as keyof typeof validMoves]) {
            delete moveWeights[direction as keyof typeof moveWeights];
        }
    }

    // Find the maximum weight
    const max:number = Math.max(...Object.values(moveWeights));
    
    // Find the direction(s) with the maximum weight
    for(const direction of Object.keys(moveWeights)) {
        if(moveWeights[direction as keyof typeof moveWeights] !== max) {
            delete moveWeights[direction as keyof typeof moveWeights];
        }
    }

    // Return a random direction with the maximum weight
    const safeMoves = Object.keys(moveWeights);
    const response = {
        move: safeMoves[Math.floor(Math.random() * safeMoves.length)],
    }

    //console.log(`${myHead.x}/${boardWidth} ${myHead.y}/${boardHeight} ${safeMoves}`)
    console.log(`${new Date().toISOString().slice(11, -1)} ${gameState.game.id} MOVE ${gameState.turn}: ${response.move}`)
    return response
}
