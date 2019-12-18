const util = require('util');

function is_wall(str) {
    return str === "#";
}

function is_open(str) {
    return str === ".";
}

function is_door(str) {
    let upper_cases = /^[A-Z]$/;
    if (str.match(upper_cases) === null)
        return false;
    else
        return true;
}

function is_key(str) {
    let lower_cases = /^[a-z]$/;
    if (str.match(lower_cases) === null)
        return false;
    else
        return true;
}

/* Return an array of immediately accessible keys, for example

     [{name: "A", steps: 10, loc: {x: 20, y: 30}}, ...]

   "immediately" means the key can be accessed without passing another key  */

function find_all_accessible_keys(map, start_loc) {
    let flood_map = [];
    for (let i = 0; i < map.length; i++)
        flood_map[i] = [];

    let s = 0; // steps
    let edge = new Set();
    edge.add(start_loc.x + start_loc.y * 100);

    let keys = [];

    while (edge.size > 0) {
        let new_edge = new Set();
        edge.forEach(function (dummy, value, set) {
            let loc = {x: value % 100, y: Math.floor(value / 100)};
            let i = loc.x;
            let j = loc.y;
            flood_map[i][j] = s;

            if (is_key(map[i][j]))
                keys.push({name: map[i][j], steps: s, loc: {x: i, y: j}});
            else {
                let next_locations = [
                    {x: i, y: j - 1},
                    {x: i + 1, y: j},
                    {x: i, y: j + 1},
                    {x: i - 1, y: j} ];

                for (let next of next_locations) {
                    /* no need to check out-of-boundary */

                    let next_i = next.x;
                    let next_j = next.y;

                    if (flood_map[next_i][next_j] !== undefined)
                        continue;

                    if (is_open(map[next_i][next_j]) || is_key(map[next_i][next_j]))
                        new_edge.add(next_i + next_j * 100);
                }
            }
        });
        s++;
        edge = new_edge;
    }

    return keys;
}

function find_fewest_steps(map, start_loc, depth)
{
    //console.log("finding fewest steps from" + util.inspect(start_loc, {depth: 3, colors: false}));
    let keys = find_all_accessible_keys(map, start_loc);
    //console.log("    accessible keys:" + util.inspect(keys, {depth: 3, colors: false}));

    if (keys.length === 0) {
        //console.log("all keys have been found!");
        return 0;
    }

    let fewest_steps;

    for (let k = 0; k < keys.length; k++) {
        let key = keys[k];

        //if (depth <= 1)
        //    console.log(`depth: ${depth} ${k + 1} of ${keys.length}`);

        // create a new map without the key and the corresponding door
        let new_map = [];
        for (i = 0; i < map.length; i++) {
            new_map.push([]);
            for (j = 0; j < map[i].length; j++) {
                if (map[i][j] === key.name
                    || map[i][j] === key.name.toUpperCase())
                    new_map[i].push(".");
                else
                    new_map[i].push(map[i][j]);
            }
        }

        let steps = key.steps + find_fewest_steps(new_map, key.loc, depth + 1);
        if (fewest_steps === undefined || steps < fewest_steps)
            fewest_steps = steps;
    }

    return fewest_steps;
}

function solve(input, part) {
    if (part === 2)
        return 0;
    let map = [];
    input.forEach(line => {
        map.push(line.split(''));
    });

    let loc;
outer:
    for (i = 0; i < map.length; i++)
        for (j = 0; j < map.length; j++)
            if (map[i][j] === "@") {
                // console.log(`@ is at (${i},${j})`);
                loc = {x: i, y: j};
            }

    let depth = 0;
    let fewest_steps = find_fewest_steps(map, loc, depth);
    console.log(`The fewest steps: ${fewest_steps}`);
    return fewest_steps;
}

// abc 742
// abcdef 1526
const expected = part => part === 1 ? 0 : 0;

module.exports = {solve,expected};
