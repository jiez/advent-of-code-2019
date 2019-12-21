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

/* Return a map of immediately accessible entrance, keys and doors, for example

     {"A" => steps, ...}

   "immediately" means they can be accessed without passing other nodes */

function find_neighbors(map, start_loc) {
    let flood_map = [];
    for (let i = 0; i < map.length; i++)
        flood_map[i] = [];

    let d = 0; // distance
    let neighbors = new Map();

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
            //console.log(`take (${i},${j}) from edge`);

            let next_locations = [
                {x: i, y: j - 1},
                {x: i + 1, y: j},
                {x: i, y: j + 1},
                {x: i - 1, y: j} ];

            for (let next of next_locations) {
                // no need to check out-of-boundary

                let next_i = next.x;
                let next_j = next.y;

                if (flood_map[next_i][next_j] !== undefined) {
                    //console.log(`  (${next_i},${next_j}) has been explored`);
                    continue;
                }

                if (is_entrance(map[next_i][next_j])
                    || is_key(map[next_i][next_j])
                    || is_door(map[next_i][next_j])) {
                    //console.log(`  add (${next_i},${next_j}) to neighbors`);
                    neighbors.set(map[next_i][next_j], d + 1);
                } else if (is_open(map[next_i][next_j])) {
                    //console.log(`  add (${next_i},${next_j}) to edge`);
                    new_edge.add(loc2hash({x: next_i, y: next_j}));
                }
            }
        });
        d++;
        edge = new_edge;
    }

    //console.log("Neighbors");
    //console.log(util.inspect(neighbors, {depth: 4, colors: false}));
    return neighbors;
}

function generate_vis_code(graph) {
    let nodes = [];
    let edges = [];

    for (let node of graph.keys())
        nodes.push(node);

    for (let i = 0; i < nodes.length; i++)
        for (let j = i + 1; j < nodes.length; j++)
            if (graph.get(nodes[i]).neighbors.has(nodes[j]))
                edges.push({from: i, to: j});

    console.log("// create an array with nodes");
    console.log("var nodes = new vis.DataSet([");
    for (i = 0; i < nodes.length; i++) {
        let color;
        if (is_entrance(nodes[i]))
            color = "black";
        else if (is_key(nodes[i]))
            color = "blue";
        else
            color = "red";

        console.log(`  { id: ${i + 1}, label: "${nodes[i]}", shape: "circle", color: "${color}" },`);
    }
    console.log("]);");

    console.log("// create an array with edges");
    console.log("var edges = new vis.DataSet([");
    for (i = 0; i < edges.length; i++)
        console.log(`  { from: ${edges[i].from + 1}, to: ${edges[i].to + 1} },`);
    console.log("]);");
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
    for (let i = 0; i < map.length; i++)
        for (let j = 0; j < map[i].length; j++) {
            if (is_entrance(map[i][j]) || is_key(map[i][j]) || is_door(map[i][j])) {
                graph.set(map[i][j], {loc: {x: i, y: j}});
            }
        }

    //console.log("Nodes");
    //console.log(util.inspect(graph, {depth: 4, colors: false}));
    //console.log("");

    // discover graph
    graph.forEach((value, node_name, dummy) => {
        //console.log(`${node_name} => ${util.inspect(value, {depth: 4, colors: false})}`);
        value.neighbors= find_neighbors(map, value.loc);
        //console.log(`${node_name} => ${util.inspect(value, {depth: 4, colors: false})}`);
    });

    console.log("Graph");
    console.log(util.inspect(graph, {depth: 4, colors: false}));
    console.log("");

    generate_vis_code(graph);

    return 0;
}

// abc 742
// abcdef 1526
const expected = part => part === 1 ? 0 : 0;

module.exports = {solve,expected};
