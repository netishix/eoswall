import { Asset } from './lib/asset';

interface Symbol {
    name: string;
    precision: number;
}

type Coordinate = [number, number];

interface Slot {
    id: number;
    c1: Coordinate;
    c2: Coordinate;
    title: string;
    url: string;
    image: string;
    owner: string;
}

interface SlotDescription {
    c1: Coordinate;
    c2: Coordinate;
    size: string;
    position: string;
    surface: number;
    price: Asset;
}


export { Symbol, Coordinate, Slot, SlotDescription };
