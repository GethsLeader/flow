export class Utils {
    static createUID(count) {
        count = count || 32;
        const symbols = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < count; i++) {
            result += symbols[Math.floor(Math.random() * (symbols.length - 1))];
        }
        return result;
    }
}

export class Events {
    constructor() {
        this._list = {};
    }

    on(event, callback) {
        if (!callback) {
            throw new Error('Cannot on event without callback!');
        }
        let uid = Utils.createUID();
        if (!this._list[event]) {
            this._list[event] = [];
        }
        this._list[event].push({uid: uid, callback: callback});
        return uid;
    }

    off(event, uid) {
        if (!uid) {
            throw new Error('Cannot off event without UID!');
        }
        let callback = null;
        if (this._list[event]) {
            for (let i = 0; i < this._list[event].length; i++) {
                if (this._list[event][i].uid === uid) {
                    callback = this._list[event][i].callback;
                    this._list[event].splice(i, 1);
                    break;
                }
            }
        }
        return callback;
    }

    emit(event, ...args) {
        if (this._list[event]) {
            for (let i = 0; i < this._list[event].length; i++) {
                this._list[event][i].callback(...args);
            }
        }
    }
}
