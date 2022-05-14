import { info, move } from '../src/logic'
import { Battlesnake, Coord, GameState, MoveResponse } from '../src/types.d';

function createGameState(me: Battlesnake): GameState {
    return {
        game: {
            id: "",
            ruleset: { 
                name: "",
                version: "",
                settings: {
                    foodSpawnChance: 25,
                    minimumFood: 1,
                    hazardDamagePerTurn: 14,
                    hazardMap: "hz_spiral",
                    hazardMapAuthor: "altersaddle",
                    royale: {
                        "shrinkEveryNTurns": 5
                    },
                    squad: {
                        allowBodyCollisions: true,
                        sharedElimination: true,
                        sharedHealth: true,
                        sharedLength: true
                    }
                }
            },
            source: "league",
            timeout: 0
        },
        turn: 0,
        board: {
            height: 10,
            width: 10,
            food: [],
            snakes: [me],
            hazards: []
        },
        you: me
    }
}

function createBattlesnake(id: string, body: Coord[]): Battlesnake {
    return {
        id: id,
        name: id,
        health: 0,
        body: body,
        latency: "",
        head: body[0],
        length: body.length,
        shout: "",
        squad: "",
        customizations: {
            color: "#888888",
            head: "default",
            tail: "default"
        }
    }
}

describe('Battlesnake API Version', () => {
    it('should be api version 1', () => {
        const result = info()
        expect(result.apiversion).toBe("1")
    })
})

describe('Battlesnake Moves', () => {
    it('should never move into its own neck', () => {
        // Arrange
        const me:Battlesnake = createBattlesnake("me", [{ x: 2, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 0 }])
        const gameState:GameState = createGameState(me)

        // Act 1,000x (this isn't a great way to test, but it's okay for starting out)
        for (let i = 0; i < 1000; i++) {
            const moveResponse: MoveResponse = move(gameState)
            // In this state, we should NEVER move left.
            const allowedMoves = ["up", "down", "right"]
            expect(allowedMoves).toContain(moveResponse.move)
        }
    })

    it('should not move into a wall', () => {
        const me:Battlesnake = createBattlesnake("me", [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }])
        const gameState:GameState = createGameState(me)

        // Act 1,000x (this isn't a great way to test, but it's okay for starting out)
        for (let i = 0; i < 1000; i++) {
            const moveResponse: MoveResponse = move(gameState)
            // In this state, we should NEVER move left, right, or down.
            const allowedMoves = ["up"]
            expect(allowedMoves).toContain(moveResponse.move)
        }
    })

    it('should not move into another snake', () => {
        const me:Battlesnake = createBattlesnake("me", [{ x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }])
        const gameState:GameState = createGameState(me)
        const opponent:Battlesnake = createBattlesnake("opponent", [{ x: 2, y: 1 }, { x: 3, y: 1 }, { x: 4, y: 1 }])
        gameState.board.snakes.push(opponent)

        // Act 1,000x (this isn't a great way to test, but it's okay for starting out)
        for (let i = 0; i < 1000; i++) {
            const moveResponse: MoveResponse = move(gameState)
            // In this state, we should NEVER move up, right, or down.
            const allowedMoves = ["left"]
            expect(allowedMoves).toContain(moveResponse.move)
        }
    })

    it('should not move into another snake\'s head equal or larger in size than itself', () => {
        const me:Battlesnake = createBattlesnake("me", [{ x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }])
        const gameState:GameState = createGameState(me)
        const opponent:Battlesnake = createBattlesnake("opponent", [{ x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }])
        gameState.board.snakes.push(opponent)
        
        // Act 1,000x (this isn't a great way to test, but it's okay for starting out)
        for (let i = 0; i < 1000; i++) {
            const moveResponse: MoveResponse = move(gameState)
            // In this state, we should NEVER move up, right, or down.
            const allowedMoves = ["left"]
            expect(allowedMoves).toContain(moveResponse.move)
        }
    })

    it('can move into another snake\'s head lesser in size than itself', () => {
        const me:Battlesnake = createBattlesnake("me", [{ x: 3, y: 0 }, { x: 4, y: 0 }, { x: 5, y: 0 }])
        const gameState:GameState = createGameState(me)
        const opponent:Battlesnake = createBattlesnake("opponent", [{ x: 4, y: 1 }, { x: 5, y: 1 }, { x: 6, y: 1 }])
        gameState.board.snakes.push(opponent)
        const opponent2:Battlesnake = createBattlesnake("opponent2", [{ x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 2, y: 1 }])
        gameState.board.snakes.push(opponent2)
        
        // Act 1,000x (this isn't a great way to test, but it's okay for starting out)
        for (let i = 0; i < 1000; i++) {
            const moveResponse: MoveResponse = move(gameState)
            // In this state, we should NEVER move left, right, or down.
            const allowedMoves = ["up"]
            expect(allowedMoves).toContain(moveResponse.move)
        }
    })

    it('should not trap itself to a wall', () => {
        const me:Battlesnake = createBattlesnake("me", [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 0 }, { x: 2, y: 0 }])
        const gameState:GameState = createGameState(me)
        
        // Act 1,000x (this isn't a great way to test, but it's okay for starting out)
        for (let i = 0; i < 1000; i++) {
            const moveResponse: MoveResponse = move(gameState)
            // In this state, we should NEVER move left, right, or down.
            const allowedMoves = ["up"]
            expect(allowedMoves).toContain(moveResponse.move)
        }
    })

    it('should not trap itself to itself', () => {
        const me:Battlesnake = createBattlesnake("me", [
            { x: 4, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 2 }, { x: 3, y: 3 },
            { x: 3, y: 4 }, { x: 3, y: 5 }, { x: 4, y: 5 }, { x: 5, y: 5 },
            { x: 5, y: 4 }, { x: 5, y: 3 }, { x: 5, y: 2 }, { x: 6, y: 2 },
            { x: 6, y: 3 }, { x: 6, y: 4 }, { x: 6, y: 5 }])
        const gameState:GameState = createGameState(me)

        gameState.board.food = [{ x: 4, y: 2 }, { x: 4, y: 3 }, { x: 4, y: 4 }]
        
        // Act 1,000x (this isn't a great way to test, but it's okay for starting out)
        for (let i = 0; i < 1000; i++) {
            const moveResponse: MoveResponse = move(gameState)
            // In this state, we should NEVER move left, right, or down.
            const allowedMoves = ["down", "right"]
            expect(allowedMoves).toContain(moveResponse.move)
        }
    })
})
