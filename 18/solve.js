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

function key_of_door(str) {
    return String.fromCharCode(str.charCodeAt(0) + 97 - 65);
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

// find all nodes that can be reached from start with keys in owned_keys
// calculate the shortest path from start to each of these nodes and
// return them as a map.
function find_reachable_nodes(graph, start, owned_keys) {
    let unvisited = new Set();
    graph.forEach((value, node_name, g) => {
        unvisited.add(node_name);
    });

    let reachable_nodes = new Map();
    reachable_nodes.set(start, 0);

    let current = start;
    while (unvisited.size > 0) {
        let current_steps = reachable_nodes.get(current);

        graph.get(current).neighbors.forEach((value, neighbor, neighbors) => {
            // if it's a door but we don't have the key, we cannot pass
            // through it
            if (is_door(neighbor) && !owned_keys.has(key_of_door(neighbor)))
                return;

            if (unvisited.has(neighbor)) {
                let steps = current_steps + value;
                if (reachable_nodes.get(neighbor) === undefined
                    || reachable_nodes.get(neighbor) > steps)
                    reachable_nodes.set(neighbor, steps);
            }
        });

        unvisited.delete(current);

        let smallest_steps;
        unvisited.forEach((dummy, node_name, s) => {
            if (reachable_nodes.get(node_name) !== undefined)
                if (smallest_steps === undefined
                    || smallest_steps > reachable_nodes.get(node_name)) {
                    smallest_steps = reachable_nodes.get(node_name);
                    current = node_name;
                }
        });

        // all unvisited nodes are not reachable
        if (smallest_steps === undefined) {
            // console.log(`${start} cannot reach any of ${unvisited}`);
            break;
        }
    }

    return reachable_nodes;
}

function find_fewest_steps(graph, start, owned_keys, num_of_all_keys, depth) {
    // if this is the last key, we are done!
    if (owned_keys.size === num_of_all_keys)
        return 0;

    owned_keys.add(start);
    //console.log(`Add ${start} to owned keys`);
    //console.log(owned_keys);

    // find the shortest path for all nodes which can be reached from start
    let reachable_nodes = find_reachable_nodes(graph, start, owned_keys);
    //console.log(`${start} can reach`);
    //console.log(reachable_nodes);

    let fewest_steps;
    let via;
    for (let node_name of reachable_nodes.keys())
        if (is_key(node_name) && !owned_keys.has(node_name)) {
            let steps = find_fewest_steps(graph, node_name, owned_keys, num_of_all_keys, depth + 1);
            if (steps === undefined)
                continue;
            steps += reachable_nodes.get(node_name);
            if (fewest_steps === undefined || steps < fewest_steps) {
                fewest_steps = steps;
                via = node_name;
            }
        }

    owned_keys.delete(start);
    //console.log(`Fewest steps is ${fewest_steps} via ${via}`);
    return fewest_steps;
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

    //generate_vis_code(graph);

    let num_of_all_keys = 0;
    graph.forEach((value, node_name, dummy) => {
        if (is_key(node_name))
            num_of_all_keys++;
    });

    let depth = 0;
    let owned_keys = new Set();
    let fewest_steps = find_fewest_steps(graph, "@", owned_keys, num_of_all_keys, depth);
    console.log(`The fewest steps: ${fewest_steps}`);
    return fewest_steps;
}

// abc 742
// abcdef 1526
const expected = part => part === 1 ? 0 : 0;

module.exports = {solve,expected};