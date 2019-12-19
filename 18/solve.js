const util = require('util');

function is_entrance(str) {
    return str === "@";
}

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

function loc2hash(loc) {
    return (loc.x + loc.y * 100);
}

function hash2loc(hash) {
    return {x: hash % 100, y: Math.floor(hash / 100)};
}

/* Return an array of immediately accessible entrance, keys and doors, for example

     [{name: "A", steps: 10, loc: {x: 20, y: 30}}, ...]

   "immediately" means they can be accessed without passing other objects */

function find_children(map, start_loc) {
    let flood_map = [];
    for (let i = 0; i < map.length; i++)
        flood_map[i] = [];

    let d = 0; // distance
    let children = [];

    let edge = new Set();
    edge.add(loc2hash(start_loc));

    while (edge.size > 0) {
        let new_edge = new Set();
        edge.forEach(function (dummy, value, set) {
            let loc = hash2loc(value);
            let i = loc.x;
            let j = loc.y;
            flood_map[i][j] = d;
            //console.log("");
            //console.log("take " + map[i][j] + ` (${i},${j}) from edge`);

            let next_locations = [
                {x: i, y: j - 1},
                {x: i + 1, y: j},
                {x: i, y: j + 1},
                {x: i - 1, y: j} ];

            for (let next of next_locations) {
                /* no need to check out-of-boundary */

                let next_i = next.x;
                let next_j = next.y;


                if (flood_map[next_i][next_j] !== undefined) {
                    //console.log(`  explored: next i: ${next_i}, next j: ${next_j}`);
                    continue;
                }

                if (is_open(map[next_i][next_j])) {
                    //console.log("  " + map[next_i][next_j] + " added to edge");
                    new_edge.add(loc2hash({x: next_i, y: next_j}));
                } else if (is_entrance(map[next_i][next_j])
                           || is_key(map[next_i][next_j])
                           || is_door(map[next_i][next_j])) {
                    //console.log("add " + map[next_i][next_j] + " to children");
                    children.push({name: map[next_i][next_j], distance: d + 1, loc: {x: next_i, y: next_j}});
                }
            }
        });
        d++;
        edge = new_edge;
    }

    //console.log("Children");
    //console.log(util.inspect(children, {depth: 4, colors: false}));
    return children;
}

function solve(input, part) {
    if (part === 2)
        return 0;

    let map = [];
    input.forEach(line => {
        map.push(line.split(''));
    });

    //console.log("Map");
    //console.log(map);

    let graph = new Map();
    for (i = 0; i < map.length; i++)
        for (j = 0; j < map[i].length; j++) {
            if (is_entrance(map[i][j]) || is_key(map[i][j]) || is_door(map[i][j])) {
                graph.set(map[i][j], {loc: {x: i, y: j}});
            }
        }

    //console.log("Graph");
    //console.log(util.inspect(graph, {depth: 4, colors: false}));
    //console.log("");

    /* discover graph */
    graph.forEach((value, key, dummy) => {
        //console.log(`${key} => ${util.inspect(value, {depth: 4, colors: false})}`);
        value.children = find_children(map, value.loc);
        //console.log(`${key} => ${util.inspect(value, {depth: 4, colors: false})}`);
    });

    //console.log("");
    //console.log("Graph");
    //console.log(util.inspect(graph, {depth: 4, colors: false}));

    return 0;
}

// abc 742
// abcdef 1526
const expected = part => part === 1 ? 0 : 0;

module.exports = {solve,expected};
