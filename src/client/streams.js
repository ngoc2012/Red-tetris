import flyd from "flyd";
import { PieceState } from "../common/enums.js";

export const pos$ = flyd.stream(3);
export const rot$ = flyd.stream(0);
export const fall_count$ = flyd.stream(0);
export const lock_count$ = flyd.stream(0);
export const state$ = flyd.stream(PieceState.FALLING);
export const piece$ = flyd.stream("");
export const next_pieces$ = flyd.stream([]);
export const keys$ = flyd.stream([]);
export const touche$ = flyd.stream({start: {x:0, y:0}, end: {x:0, y:0}});
export const basename$ = flyd.stream('/');
