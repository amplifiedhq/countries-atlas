import { City } from "./city.type";
export interface State {
    name: string;
    state_code: string;
    latitude: string | null;
    longitude: string | null;
    cities?: City[];
}