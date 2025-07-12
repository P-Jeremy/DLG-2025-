"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Song = void 0;
class Song {
    constructor(props) {
        this.id = props.id;
        this.title = props.title;
        this.author = props.author;
        this.lyrics = props.lyrics;
        this.tab = props.tab;
        this.tags = props.tags;
    }
}
exports.Song = Song;
