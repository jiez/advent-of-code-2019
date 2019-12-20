const util = require('util');

function is_wall(str) {
    return str === "#";
}

function is_open(str) {
    return str === ".";
}

function is_letter(str) {
    let upper_cases = /^[A-Z]$/;
    if (str.match(upper_cases) === null)
        return false;
    else
        return true;
}

function is_void(str) {
    return str === " " || is_letter(str);
}

function loc2hash(loc) {
    return (loc.x + loc.y * 1000);
}

function hash2loc(hash) {
    return {x: hash % 1000, y: Math.floor(hash / 1000)};
}

/* On direction of a node is void. If we go that direction and hit a non-void,
   it's an inner node. */
function is_inner(map, x, y) {
    if (is_void(map[x - 1][y])) {
        do {
            x--;
            if (!is_void(map[x][y]))
                return true;
        } while (x > 0);

        return false;
    } else if (is_void(map[x + 1][y])) {
        do {
            x++;
            if (!is_void(map[x][y]))
                return true;
        } while (x < map.length - 1);

        return false;
    } else if (is_void(map[x][y - 1])) {
        do {
            y--;
            if (!is_void(map[x][y]))
                return true;
        } while (y > 0);

        return false;
    } else if (is_void(map[x][y + 1])) {
        do {
            y++;
            if (!is_void(map[x][y]))
                return true;
        } while (y < map[0].length - 1);

        return false;
    }

    console.log("Error: we should not be here");
}

/* Return a Map of immediately accessible nodes, include entrance, exit and
   portals, for example

     {"AB" => steps, ...}

   "immediately" means they can be accessed without passing other nodes. */
function find_neighbors(map, graph, nodes, start_loc) {
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

                if (nodes.has(loc2hash({x: next_i, y: next_j}))) {
                    let neighbor = nodes.get(loc2hash({x: next_i, y: next_j}));
                    //console.log(`  add (${next_i},${next_j}) to neighbors`);
                    neighbors.set(neighbor, d + 1);
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

function find_shortest_path(graph, start, end) {
    let unvisited = new Set();
    graph.forEach((value, node_name, g) => {
        unvisited.add(node_name);
    });

    graph.get(start).steps = 0;

    let current = start;
    while (unvisited.has(end)) {
        //console.log("Graph");
        //console.log(util.inspect(graph, {depth: 4, colors: false}));
        //console.log("Unvisited");
        //console.log(util.inspect(unvisited, {depth: 4, colors: false}));
        //console.log(`Current: ${current}`);

        let current_steps = graph.get(current).steps;
        //console.log(`current steps: ${current_steps}`);

        graph.get(current).neighbors.forEach((value, neighbor, neighbors) => {
            //console.log(`  neighbor: ${neighbor} => ${value}`);
            if (unvisited.has(neighbor)) {
                //console.log(`  this neighbor is in unvisited set`);
                let steps = current_steps + value;
                //console.log(`  steps is ${steps} through ${current}`);
                if (graph.get(neighbor).steps === undefined
                    || graph.get(neighbor).steps > steps) {
                    //console.log(`  update its steps`);
                    graph.get(neighbor).steps = steps;
                } else {
                    //console.log(`  not update its steps`);
                }
            }
        });

        unvisited.delete(current);
        if (current === end)
            break;

        // find the node in unvisited set with the smallest steps
        let smallest_steps;
        unvisited.forEach((dummy, node_name, s) => {
            if (graph.get(node_name).steps !== undefined)
                if (smallest_steps === undefined
                    || smallest_steps > graph.get(node_name).steps) {
                    smallest_steps = graph.get(node_name).steps;
                    current = node_name;
                    //console.log(`${current} has smallest steps ${smallest_steps}`);
                }
        });

        if (smallest_steps === undefined) {
            //console.log(`There is no path from ${start} to ${end}`);
            break;
        }
    }

    return graph.get(end).steps;
}

// delete node from graph

function name_with_level(name, level) {
    return name + "@" + level;
}

function delete_node(graph, node_name) {
    // delete it from all its neighbors's neighbors
    let neighbors = graph.get(node_name).neighbors;
    neighbors.forEach((value, neighbor, dummy) => {
        graph.get(neighbor).neighbors.delete(node_name);
    });

    // delete itself from graph
    graph.delete(node_name);
}

function build_recursive_graph(graph, levels) {
    recursive_graph = new Map();

    for (let level = 0; level < levels; level++) {
        graph.forEach((value, node_name, g) => {
            let new_neighbors = new Map();
            value.neighbors.forEach((steps, neighbor, dummy) => {
                new_neighbors.set(name_with_level(neighbor, level), steps);
            });
            recursive_graph.set(name_with_level(node_name, level), {neighbors: new_neighbors});
        });
    }

    //console.log("Graph");
    //console.log(util.inspect(recursive_graph, {depth: 4, colors: false}));
    //console.log("");

    // remove all AAs and ZZs except AA0 and ZZ0
    for (let node of ["AA", "ZZ"])
        for (let level = 1; level < levels; level++) {
            delete_node(recursive_graph, name_with_level(node, level));
        }

    //console.log("Graph");
    //console.log(util.inspect(recursive_graph, {depth: 4, colors: false}));
    //console.log("");

    // remove all outest nodes, except AA@0 and ZZ@0
    for (let node of graph.keys())
        if (node !== "AA" && node !== "ZZ" && node.slice(-1) !== "~") {
            //console.log("delete " + name_with_level(node, 0));
            delete_node(recursive_graph, name_with_level(node, 0));
        }

    // remove all most inner nodes
    for (let node of graph.keys())
        if (node.slice(-1) === "~") {
            //console.log("delete " + name_with_level(node, levels - 1));
            delete_node(recursive_graph, name_with_level(node, levels - 1));
        }

    //console.log("Graph");
    //console.log(util.inspect(recursive_graph, {depth: 4, colors: false}));
    //console.log("");

    // connect level to level
    for (let level = 0; level < levels - 1; level++)
        for (let node of graph.keys())
            if (node !== "AA" && node !== "ZZ" && node.slice(-1) !== "~") {
                let node1 = name_with_level(node + "~", level);
                let node2 = name_with_level(node, level + 1);
                if (recursive_graph.has(node1) && recursive_graph.has(node2)) {
                    recursive_graph.get(node1).neighbors.set(node2, 1);
                    recursive_graph.get(node2).neighbors.set(node1, 1);
                }
            }

    //console.log("Graph");
    //console.log(util.inspect(recursive_graph, {depth: 4, colors: false}));
    //console.log("");

    return recursive_graph;
}

function solve(input, part) {
    let map = [];
    input.forEach(line => {
        map.push(line.split(''));
    });

    //console.log("Map");
    //console.log(map);

    // find all nodes
    let graph = new Map();
    let nodes = new Map();
    for (let i = 0; i < map.length; i++)
        for (let j = 0; j < map[i].length; j++) {
            if (is_open(map[i][j])) {
                let node_name;
                if (is_letter(map[i - 2][j]) && is_letter(map[i - 1][j]))
                    node_name = [map[i - 2][j], map[i - 1][j]].join('');
                else if (is_letter(map[i + 1][j]) && is_letter(map[i + 2][j]))
                    node_name = [map[i + 1][j], map[i + 2][j]].join('');
                else if (is_letter(map[i][j - 2]) && is_letter(map[i][j - 1]))
                    node_name = [map[i][j - 2], map[i][j - 1]].join('');
                else if (is_letter(map[i][j + 1]) && is_letter(map[i][j + 2]))
                    node_name = [map[i][j + 1], map[i][j + 2]].join('');
                if (node_name !== undefined) {
                    if (is_inner(map, i, j))
                        node_name += "~";
                    graph.set(node_name, {loc: {x: i, y: j}});
                    nodes.set(loc2hash({x: i, y: j}), node_name);
                }
            }
        }

    //console.log("Nodes");
    //console.log(util.inspect(nodes, {depth: 4, colors: false}));
    //console.log("");

    // discover graph
    graph.forEach((value, node_name, g) => {
        //console.log(`${node_name} => ${util.inspect(value, {depth: 4, colors: false})}`);
        value.neighbors= find_neighbors(map, g, nodes, value.loc);
        //console.log(`${node_name} => ${util.inspect(value, {depth: 4, colors: false})}`);
    });

    //console.log("Graph");
    //console.log(util.inspect(graph, {depth: 4, colors: false}));
    //console.log("");

    if (part === 1) {
        // add portal connections
        graph.forEach((value, node_name, g) => {
            let node2 = node_name + "~";
            if (g.has(node2)) {
                g.get(node_name).neighbors.set(node2, 1);
                g.get(node2).neighbors.set(node_name, 1);
            }
        });

        //console.log("Graph");
        //console.log(util.inspect(graph, {depth: 4, colors: false}));
        //console.log("");

        // find the shortest path from AA to ZZ
        return find_shortest_path(graph, "AA", "ZZ");
    }

    // part 2

    let levels = 1;
    while (levels <= 100) {
        let recursive_graph = build_recursive_graph(graph, levels)
        let smallest_steps = find_shortest_path(recursive_graph, name_with_level("AA", 0), name_with_level("ZZ", 0));
        if (smallest_steps !== undefined) {
            console.log(`Found shortest path for ${smallest_steps} steps after recurse ${levels} levels`);
            return smallest_steps;
        }
        levels++;
    }
    console.log(`Shortest path not found after recurse ${levels} levels! Consider increase levels`);
}

const expected = part => part === 1 ? 604 : 7166;

module.exports = {solve,expected};
