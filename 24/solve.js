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

function solve(input, part) {
    if (part === 2)
        return;

    let map = [];
    input.forEach(line => {
        map.push(line.split(''));
    });

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


const expected = part => part === 1 ? 28778811 : 0;

module.exports = {solve,expected};
