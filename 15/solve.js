function address(program, value, mode) {
    const POS_MODE = 0;
    const IMM_MODE = 1;
    const REL_MODE = 2;

    if (mode === POS_MODE) {
        return value;
    } else if (mode === REL_MODE) {
        return program["relative_base"] + value;
    } else {
        console.log(`invalid mode ${mode}`);
        return 0;
    }
}

function operand(program, value, mode) {
    const POS_MODE = 0;
    const IMM_MODE = 1;
    const REL_MODE = 2;

    if (mode === IMM_MODE)
        return value;
    else if (mode === POS_MODE || mode === REL_MODE) {
        let addr = address(program, value, mode);
        if (program[addr] === undefined)
            program[addr] = 0;
        return program[addr];
    } else {
        console.log(`unknown mode ${mode}`);
        return 0;
    }
}

function run(program, input) {
    let pc = program["pc"];
    let input_index = 0;
    let output = [];
    const ADD = 1;
    const MULT = 2;
    const INPUT = 3;
    const OUTPUT = 4;
    const JUMP_IF_TRUE = 5;
    const JUMP_IF_FALSE = 6;
    const LESS_THAN = 7;
    const EQUALS = 8;
    const ADJUST_RELATIVE_BASE = 9;
    const STOP = 99;

outer:
    while (program[pc] !== STOP) {
        let opcode = program[pc] % 100;
        let a0, a1, a2;
        let mode0, mode1;
        let addr;
        let result;

        switch (opcode) {
            case INPUT:
                a0 = program[pc + 1];
                mode0 = Math.trunc(program[pc] / 100) % 10;
                addr = address(program, a0, mode0);
                if (input[input_index] === undefined) {
                    program["pc"] = pc;
                    break outer;
                }
                program[addr] = input[input_index];
                input_index++;
                pc += 2;
                break;

            case OUTPUT:
                a0 = program[pc + 1];
                mode0 = Math.trunc(program[pc] / 100) % 10;
                result = operand(program, a0, mode0);
                output.push(result);
                pc += 2;
                program["pc"] = pc;
                break outer;

            case ADD:
            case MULT:
                a0 = program[pc + 1];
                a1 = program[pc + 2];
                a2 = program[pc + 3];
                mode0 = Math.trunc(program[pc] / 100) % 10;
                mode1 = Math.trunc(program[pc] / 1000) % 10;
                mode2 = Math.trunc(program[pc] / 10000) % 10;
                addr = address(program, a2, mode2);

                if (opcode === ADD)
                    program[addr] = operand(program, a0, mode0) + operand(program, a1, mode1);
                else
                    program[addr] = operand(program, a0, mode0) * operand(program, a1, mode1);
                pc += 4;
                break;

            case JUMP_IF_TRUE:
                a0 = program[pc + 1];
                a1 = program[pc + 2];
                mode0 = Math.trunc(program[pc] / 100) % 10;
                mode1 = Math.trunc(program[pc] / 1000) % 10;

                if (operand(program, a0, mode0) !== 0)
                    pc = operand(program, a1, mode1);
                else
                    pc += 3;

                break;

            case JUMP_IF_FALSE:
                a0 = program[pc + 1];
                a1 = program[pc + 2];
                mode0 = Math.trunc(program[pc] / 100) % 10;
                mode1 = Math.trunc(program[pc] / 1000) % 10;

                if (operand(program, a0, mode0) === 0)
                    pc = operand(program, a1, mode1);
                else
                    pc += 3;

                break;

            case LESS_THAN:
                a0 = program[pc + 1];
                a1 = program[pc + 2];
                a2 = program[pc + 3];
                mode0 = Math.trunc(program[pc] / 100) % 10;
                mode1 = Math.trunc(program[pc] / 1000) % 10;
                mode2 = Math.trunc(program[pc] / 10000) % 10;
                addr = address(program, a2, mode2);

                if (operand(program, a0, mode0) < operand(program, a1, mode1))
                    program[addr] = 1;
                else 
                    program[addr] = 0;
                pc += 4;

                break;

            case EQUALS:
                a0 = program[pc + 1];
                a1 = program[pc + 2];
                a2 = program[pc + 3];
                mode0 = Math.trunc(program[pc] / 100) % 10;
                mode1 = Math.trunc(program[pc] / 1000) % 10;
                mode2 = Math.trunc(program[pc] / 10000) % 10;
                addr = address(program, a2, mode2);

                if (operand(program, a0, mode0) === operand(program, a1, mode1))
                    program[addr] = 1;
                else 
                    program[addr] = 0;
                pc += 4;

                break;

            case ADJUST_RELATIVE_BASE:
                a0 = program[pc + 1];
                mode0 = Math.trunc(program[pc] / 100) % 10;

                program["relative_base"] += operand(program, a0, mode0);
                pc += 2;

                break;

            default:
                console.log(`unknown opcode ${program[pc]} @ ${pc}`);
                pc += 1;
                break outer;
        }
    }

    return output;
}

const DIR_NORTH = 1;
const DIR_SOUTH = 2;
const DIR_WEST = 3;
const DIR_EAST = 4;

const MAP_EXPLORED = 1;
const MAP_WALL = 2;
const MAP_OXYGEN = 3;

const OUTPUT_WALL = 0;
const OUTPUT_OK = 1;
const OUTPUT_OXYGEN = 2;

/* Before using this function to create an animation, run this command

        setterm -cursor off

   to hide cursor.  */

function show_map(map)
{
    console.log("Map");
    for (j = 0; j < map["size"]["height"] ; j++) {
        for (i = 0; i < map["size"]["width"]; i++) {
            if (i === map["droid"]["x"] && j === map["droid"]["y"]) {
                process.stdout.write("D");
                continue;
            }

            if (map[i][j] === undefined)
                process.stdout.write(" ");
            else if (map[i][j] === MAP_EXPLORED)
                process.stdout.write(".");
            else if (map[i][j] === MAP_WALL)
                process.stdout.write("#");
            else if (map[i][j] === MAP_OXYGEN)
                process.stdout.write("X");
            else
                process.stdout.write("?");
        }
        process.stdout.write("\n");
    }
/*
    if (map["oxygen"] === undefined)
        for (j = 0; j < map["size"]["height"]; j++)
            process.stdout.write("\033[F");
*/
}

function show_map_with_flood(map, flood_map)
{
    console.log("Map");
    for (j = 0; j < map["size"]["height"] ; j++) {
        for (i = 0; i < map["size"]["width"]; i++) {
            if (i === map["droid"]["x"] && j === map["droid"]["y"]) {
                process.stdout.write("D");
                continue;
            }

            if (map[i][j] === undefined)
                process.stdout.write(" ");
            else if (map[i][j] === MAP_EXPLORED) {
                if (flood_map[i][j] === undefined)
                    process.stdout.write(".");
                else
                    process.stdout.write((flood_map[i][j] % 10).toString());
            } else if (map[i][j] === MAP_WALL)
                process.stdout.write("#");
            else if (map[i][j] === MAP_OXYGEN)
                process.stdout.write("X");
            else
                process.stdout.write("?");
        }
        process.stdout.write("\n");
    }
/*
    if (map["oxygen"] === undefined)
        for (j = 0; j < map["size"]["height"]; j++)
            process.stdout.write("\033[F");
*/
}


/* map is a two-dimensional array with the following additional properies:

     "size": size of map {width, height},
     "droid": current location of Droid {x, y},
     "oxygen": location of Oxygen {x, y},

   map[x][y]: x is west-east, 0 is west; y is north-south, 0 is north.  */

function explore(map, program, back_dir) {
    /* droid current location */
    let x = map["droid"]["x"];
    let y = map["droid"]["y"];
    let dir_str = ["UNKNOWN", "North", "South", "West", "East"];

    let next_locations = [
        {"x": x, "y": y - 1, "dir": DIR_NORTH, "back_dir": DIR_SOUTH},
        {"x": x + 1, "y": y, "dir": DIR_EAST, "back_dir": DIR_WEST},
        {"x": x, "y": y + 1, "dir": DIR_SOUTH, "back_dir": DIR_NORTH},
        {"x": x - 1, "y": y, "dir": DIR_WEST, "back_dir": DIR_EAST} ];

    //console.log(`Explore from (${x},${y})` + " with back direction " + dir_str[back_dir]);

    for (let next of next_locations) {
        if (next["x"] < 0 || next["x"] >= map["size"]["width"]) {
            console.log("Map is too narrow, please increase its width!");
            return;
        }
        if (next["y"] < 0 || next["y"] >= map["size"]["heigth"]) {
            console.log("Map is too short, please increase its heigth!");
            return;
        }

        let next_x = next["x"];
        let next_y = next["y"];

        //console.log(`  Try (${next_x},${next_y}) at direction ` + dir_str[next["dir"]]);

        if (map[next_x][next_y] === undefined) {
            //console.log("  Not explored yet, run program to explore...");
            let output = run(program, [next["dir"]]);

            if (output[0] === OUTPUT_OK) {
                //console.log("    Output: " + output[0] + "(OK)");
                map[next_x][next_y] = MAP_EXPLORED;

                map["droid"]["x"] = next_x;
                map["droid"]["y"] = next_y;

                //show_map(map);

                explore(map, program, next["back_dir"]);
            } else if (output[0] === OUTPUT_OXYGEN) {
                //console.log("    Output: " + output[0] + "(OXYGEN)");
                map[next_x][next_y] = MAP_OXYGEN;
                map["oxygen"] = {"x": next_x, "y": next_y};

                map["droid"]["x"] = next_x;
                map["droid"]["y"] = next_y;

                //show_map(map);

                explore(map, program, next["back_dir"]);
            } else if (output[0] === OUTPUT_WALL) {
                //console.log("    Output: " + output[0] + "(WALL)");
                map[next_x][next_y] = MAP_WALL;

                //show_map(map);
            } else {
                //console.log("    Output: " + output[0] + "(UNKNOWN)");
            }
        } else if (map[next_x][next_y] === MAP_WALL) {
            //console.log("  It's already explored (WALL)");
        } else if (map[next_x][next_y] === MAP_EXPLORED) {
            //console.log("  It's already explored (OK)");
        } else if (map[next_x][next_y] === MAP_OXYGEN) {
            //console.log("  It's already explored (OXYGEN)");
        } else {
            //console.log("  It's Unknown!!!");
        }
    }

    if (back_dir !== undefined) {
        //console.log("Move back, direction " + dir_str[back_dir]);
        let output = run(program, [back_dir]);
        if (output[0] !== OUTPUT_OK && output[0] !== OUTPUT_OXYGEN)
            console.log("Failed to move back (output " + output[0] +")");

        /* update Droid location on the map */
        if (back_dir === DIR_NORTH)
            map["droid"]["y"] = y - 1;
        else if (back_dir === DIR_EAST)
            map["droid"]["x"] = x + 1;
        else if (back_dir === DIR_SOUTH)
            map["droid"]["y"] = y + 1;
        else if (back_dir === DIR_WEST)
            map["droid"]["x"] = x - 1;

        //show_map(map);
    }

    return;
}

function flood(map, flood_map, init_loc) {
    let moves = 0;
    let edge = new Set();

    edge.add(JSON.stringify(init_loc));

    while (edge.size > 0) {
        let new_edge = new Set();
        edge.forEach(function (key, value, set) {
            let loc = JSON.parse(value);
            let x = loc["x"];
            let y = loc["y"];
            flood_map[x][y] = moves;

            let next_locations = [
                {"x": x, "y": y - 1},
                {"x": x + 1, "y": y},
                {"x": x, "y": y + 1},
                {"x": x - 1, "y": y} ];

            for (let next of next_locations) {
                /* no need to check out-of-boundary */

                let next_x = next["x"];
                let next_y = next["y"];

                if (flood_map[next_x][next_y] !== undefined)
                    continue;

                if (map[next_x][next_y] === MAP_EXPLORED
                    || map[next_x][next_y] === MAP_OXYGEN)
                    new_edge.add(JSON.stringify({"x": next_x, "y": next_y}));
            }
        });
        moves++;
        edge = new_edge;
        //show_map_with_flood(map, flood_map);
    }

    return moves - 1;
}

function solve(input, part) {
    let program = input[0].split(',').map(x => Number(x));
    program["pc"] = 0;
    program["relative_base"] = 0;

    const WIDTH = 45;
    const HEIGHT = 45;
    let map = [];
    for (let i = 0; i < WIDTH; i++)
        map[i] = [];

    map["size"] = {"width": WIDTH, "height": HEIGHT};

    let init_x = Math.floor(WIDTH / 2);
    let init_y = Math.floor(HEIGHT / 2);
    map["droid"] = {"x": init_x, "y": init_y};

    map[init_x][init_y] = MAP_EXPLORED;

    //show_map(map);

    explore(map, program, undefined);

    //show_map(map);
    if (map["oxygen"] === undefined) {
        console.log("Oxygen system not found!!!");
        return;
    }

    let oxygen_x = map["oxygen"]["x"];
    let oxygen_y = map["oxygen"]["y"];

    let flood_map = [];
    for (let i = 0; i < map.length; i++)
        flood_map[i] = [];

    flood(map, flood_map, {"x": init_x, "y": init_y});

    if (part === 1)
        return flood_map[oxygen_x][oxygen_y];

    let flood_map2 = [];
    for (let i = 0; i < map.length; i++)
        flood_map2[i] = [];

    let minutes = flood(map, flood_map2, {"x": oxygen_x, "y": oxygen_y});

    //show_map_with_flood(map, flood_map2);
    return minutes;
}

const expected = part => part === 1 ? 304: 310;

module.exports = {solve,expected};
