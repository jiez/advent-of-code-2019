function num_of_adjacent_bugs(map, x, y) {
    let num = 0;
    for (pos of [[x - 1, y], [x, y + 1], [x + 1, y], [x, y - 1]]) {
        if (pos[0] >= 0 && pos[0] < map.length && pos[1] >= 0 && pos[1] < map[0].length)
            if (map[pos[0]][pos[1]] === "#")
                num++;
    }
    //console.log(`(${x},${y}) has ${num} adjacent bugs`);
    return num;
}

function evolve(map) {
    let new_map = [];
    for (let i = 0; i < map.length; i++)
        new_map.push([]);

    for (let i = 0; i < map.length; i++)
        for (let j = 0; j < map[i].length; j++)
            if (map[i][j] === "."
                && (num_of_adjacent_bugs(map, i, j) == 1
                    || num_of_adjacent_bugs(map, i, j) == 2))
                new_map[i][j] = "#";
            else if (map[i][j] === "#"
                     && num_of_adjacent_bugs(map, i, j) !== 1)
                new_map[i][j] = ".";
            else
                new_map[i][j] = map[i][j];

    return new_map;
}

function show_map(map) {
    console.log("Map");
    for (let i = 0; i < map.length; i++)
        console.log(map[i].join(''));
}

// evaluate biodiversity_rating
function evaluate(map) {
    let raiting = 1;
    let total = 0;

    for (let i = 0; i < map.length; i++)
        for (let j = 0; j < map[i].length; j++) {
            if (map[i][j] === "#")
                total += raiting;
            raiting *= 2;
        }

    return total;
}

function solve_part_1(map) {
    let raitings = new Set();

    while (true) {
        //show_map(map);

        let raiting = evaluate(map);

        if (raitings.has(raiting))
            return raiting;
        else
            raitings.add(raiting);

        map = evolve(map);
    }
}

function num_of_adjacent_bugs_2(maps, z, x, y) {
    const central_x = Math.floor(maps[z].length / 2)
    const central_y = Math.floor(maps[z][x].length / 2)
    const outer_central_x = Math.floor(maps[z - 1].length / 2)
    const outer_central_y = Math.floor(maps[z - 1][x].length / 2)
    let num = 0;

    //console.log(`(${z},${x},${y})`);

    // left side

    if (y === 0) {
        if (maps[z - 1][outer_central_x][outer_central_y - 1] === "#")
            num++;
    } else if (y === central_y + 1 && x === central_x) {
        for (i = 0; i < maps[z + 1].length; i++)
            if (maps[z + 1][i][maps[z + 1][0].length - 1] === "#")
                num++;
    } else if (maps[z][x][y - 1] === "#")
        num++;

    //console.log(`(${z},${x},${y}) has ${num} adjacent bugs on left side`);

    // right side

    if (y === maps[z][0].length - 1) {
        if (maps[z - 1][outer_central_x][outer_central_y + 1] === "#")
            num++;
    } else if (y === central_y - 1 && x === central_x) {
        for (i = 0; i < maps[z + 1].length; i++)
            if (maps[z + 1][i][0] === "#")
                num++;
    } else if (maps[z][x][y + 1] === "#")
        num++;

    //console.log(`(${z},${x},${y}) has ${num} adjacent bugs on left and right side`);

    // up side

    if (x === 0) {
        if (maps[z - 1][outer_central_x - 1][outer_central_y] === "#")
            num++;
    } else if (x === central_x + 1 && y === central_y) {
        for (j = 0; j < maps[z + 1][0].length; j++)
            if (maps[z + 1][maps[z + 1].length - 1][j] === "#")
                num++;
    } else if (maps[z][x - 1][y] === "#")
        num++;

    //console.log(`(${z},${x},${y}) has ${num} adjacent bugs on left, right and up side`);

    // down side

    if (x === maps[z].length - 1) {
        if (maps[z - 1][outer_central_x + 1][outer_central_y] === "#")
            num++;
    } else if (x === central_x - 1 && y === central_y) {
        for (j = 0; j < maps[z + 1][0].length; j++)
            if (maps[z + 1][0][j] === "#")
                num++;
    } else if (maps[z][x + 1][y] === "#")
        num++;

    //console.log(`(${z},${x},${y}) has ${num} adjacent bugs`);
    return num;
}

function evolve_2(maps, central_level, max_spread) {
    //console.log(`central_level: ${central_level}, max_spread: ${max_spread}`);
    let new_maps = [];
    for (let k = 0; k < maps.length; k++) {
        new_maps.push([]);
        for (let i = 0; i < maps[k].length; i++) {
            new_maps[k].push([]);
            for (let j = 0; j < maps[k][i].length; j++)
                new_maps[k][i].push(".");
        }
    }

    for (let k = central_level - max_spread; k <= central_level + max_spread; k++)
        for (let i = 0; i < maps[k].length; i++)
            for (let j = 0; j < maps[k][i].length; j++) {
                if (i === Math.floor(maps[k].length / 2)
                    && j === Math.floor(maps[k][i].length / 2)) {
                    new_maps[k][i][j] = "."
                    continue;
                }

                //console.log(`k: ${k}, i: ${i}, j: ${j}`);
                let num = num_of_adjacent_bugs_2(maps, k, i, j);

                if (maps[k][i][j] === "." && (num === 1 || num === 2))
                    new_maps[k][i][j] = "#";
                else if (maps[k][i][j] === "#" && num !== 1)
                    new_maps[k][i][j] = ".";
                else
                    new_maps[k][i][j] = maps[k][i][j];
            }

    return new_maps;
}

function show_maps(maps, central_level, max_spread, minute) {
    console.log(`Maps @ ${minute}`);

    for (let k = central_level - max_spread; k <= central_level + max_spread; k++) {
        console.log(`Level: ${k - central_level}`);
        for (let i = 0; i < maps[k].length; i++)
            console.log(maps[k][i].join(''));
    }
}

function count_bugs_2(maps) {
    let num = 0;

    for (let k = 0; k < maps.length; k++)
        for (let i = 0; i < maps[k].length; i++)
            for (let j = 0; j < maps[k][i].length; j++)
                if (maps[k][i][j] === "#")
                    num++;

    return num;
}

function solve_part_2(map) {
    const minutes = 200;
    const levels = (Math.ceil(minutes / 2) + 1) * 2 + 1;
    let maps = [];
    for (k = 0; k < levels; k++) {
        maps.push([]);
        for (i = 0; i < map.length; i++) {
            maps[k].push([]);
            for (j = 0; j < map[i].length; j++)
                maps[k][i].push(".");
        }
    }
    for (i = 0; i < map.length; i++)
        for (j = 0; j < map[i].length; j++)
            maps[Math.ceil(minutes / 2) + 1][i][j] = map[i][j];

    for (let i = 1; i <= minutes; i++) {
        maps = evolve_2(maps, Math.ceil(minutes / 2) + 1, Math.ceil(i / 2));
        //show_maps(maps, Math.ceil(minutes / 2) + 1, Math.ceil(i / 2), i);
    }

    return count_bugs_2(maps);
}

function solve(input, part) {
    let map = [];
    input.forEach(line => {
        map.push(line.split(''));
    });

    if (part === 1)
        return solve_part_1(map);
    else
        return solve_part_2(map);
}

const expected = part => part === 1 ? 28778811 : 2097;

module.exports = {solve,expected};
