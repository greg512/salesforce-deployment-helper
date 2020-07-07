/**
 *    Copyright 2020 Greg Lovelidge

 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */
class Traversal {
    constructor(data, logCallback) {
        this.logCallback = logCallback;
        this.traverse(data, 0);
    }

    traverse(x, level) {
        if (isArray(x)) {
            this.traverseArray(x);
        } else if (typeof x === 'object' && x !== null) {
            this.traverseObject(x);
        } else {
            if (this.logCallback) this.logCallback(x, level);
        }
    }

    traverseArray(arr) {
        arr.forEach((x) => {
            this.traverse(x);
        });
    }

    traverseObject(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key) && key !== 'level') {
                this.traverse(obj[key], obj.level);
            }
        }
    }
}

function isArray(o) {
    return Object.prototype.toString.call(o) === '[object Array]';
}

module.exports = Traversal;
