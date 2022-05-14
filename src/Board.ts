import { Coord } from "./types.d"
import { Tile, TileType } from "./types"

export class Board {
    protected width: number;
    protected height: number;
    protected tiles: Tile[][];
    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        for(let y = 0; y < height; y++) {
            this.tiles[y] = [];
            for(let x = 0; x < width; x++) {
                this.tiles[y][x] = { 
                    coord: { x: x, y: y },
                    type: TileType.EMPTY,
                    hazard: false
                };
            }
        }
    }

    getTile(coord: Coord): Tile {
        return this.tiles[coord.y][coord.x];
    }

    setType(coord: Coord, type: TileType) {
        this.tiles[coord.y][coord.x].type = type;
    }

    setHazard(coord: Coord, hazard: boolean) {
        this.tiles[coord.y][coord.x].hazard = hazard;
    }
    
    setId(coord: Coord, id: string) {
        this.tiles[coord.y][coord.x].id = id;
    }

    getNeighbors(coord: Coord): Tile[] {
        let neighbors: Tile[] = [];
        if(coord.x > 0) {
            neighbors.push(this.tiles[coord.y][coord.x - 1]);
        }
        if(coord.x < this.width - 1) {
            neighbors.push(this.tiles[coord.y][coord.x + 1]);
        }
        if(coord.y > 0) {
            neighbors.push(this.tiles[coord.y - 1][coord.x]);
        }
        if(coord.y < this.height - 1) {
            neighbors.push(this.tiles[coord.y + 1][coord.x]);
        }
        return neighbors;
    }

    validMove(coord: Coord): boolean {
        if(coord.x < 0 || coord.x >= this.width || coord.y < 0 || coord.y >= this.height) {
            return false;
        }
        return this.tiles[coord.y][coord.x].type !== TileType.HEAD && this.tiles[coord.y][coord.x].type !== TileType.BODY;
    }

    findHead(id: string): Coord {
        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                if(this.tiles[y][x].type === TileType.HEAD && this.tiles[y][x].id === id) {
                    return { x: x, y: y };
                }
            }
        }
        return { x: -1 , y: -1 };
    }

    findTail(id: string): Coord {
        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                if(this.tiles[y][x].type === TileType.TAIL && this.tiles[y][x].id === id) {
                    return { x: x, y: y };
                }
            }
        }
        return { x: -1 , y: -1 };
    }

    findSnake(id: string): Coord[] {
        let snake: Coord[] = [];
        for(let y = 0; y < this.height; y++) {
            for(let x = 0; x < this.width; x++) {
                if(this.tiles[y][x].id === id) {
                    snake.push({ x: x, y: y });
                }
            }
        }
        return snake;
    }

    static getDirection(coord1: Coord, coord2: Coord): string {
        if(coord1.x === coord2.x) {
            if(coord1.y < coord2.y) {
                return "up";
            } else {
                return "down";
            }
        } else if(coord1.y === coord2.y) {
            if(coord1.x < coord2.x) {
                return "right";
            } else {
                return "left";
            }
        }
        return "";
    }

    toString(): string {
        let str = "";
        for(let y = this.height - 1; y >= 0; y--) {
            for(let x = 0; x < this.width; x++) {
                str += (this.tiles[y][x].id ?? this.tiles[y][x].type) + " ";
            }
            str += "\n";
        }
        return str;
    }

    clone(): Board {
        let board = new Board(this.width, this.height);
        board.tiles = JSON.parse(JSON.stringify(this.tiles));
        return board;
    }
        
}