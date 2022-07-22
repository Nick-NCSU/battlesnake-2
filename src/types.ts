import { Coord } from "./types.d"

export enum TileType {
    EMPTY,
    FOOD,
    HEAD,
    BODY,
    TAIL
}

export interface Tile {
    coord: Coord;
    type: TileType;
    id?: string;
    hazard: boolean;
}