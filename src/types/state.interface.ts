import { City } from "./city.type";
interface State {
    name: string;
    state_code: string;
    latitude: string;
    longitude: string;
    cities?: City[];
}