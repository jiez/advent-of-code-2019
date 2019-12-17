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

function show_map(map)
{
    console.log("Map");
    for (i = 0; i < map.length; i++) {
        for (j = 0; j < map[i].length; j++)
            process.stdout.write(String.fromCharCode(map[i][j]));
        process.stdout.write("\n");
    }
}

const NEWLINE       = 10
const SCAFFOLD      = 35;   // #
const EMPTY         = 46;   // .
const NORTH         = 94;   // ^
const SOUTH         = 118;  // v
const WEST          = 60;   // <
const EAST          = 62;   // >

const AHEAD         = 0;
const LEFT          = 76;   // L
const RIGHT         = 82;   // R

function look(map, pos, dir, toward) {
    let width = map[0].length;
    let height = map.length;
    let x = pos["x"];
    let y = pos["y"];

    if (dir === NORTH) {
        if (toward === AHEAD && x > 0)
            return map[x - 1][y];
        else if (toward === LEFT && y > 0)
            return map[x][y - 1];
        else if (toward === RIGHT && y < height - 1)
            return map[x][y + 1];
    } else if (dir === SOUTH) {
        if (toward === AHEAD && x < width - 1)
            return map[x + 1][y];
        else if (toward === LEFT && y < height - 1)
            return map[x][y + 1];
        else if (toward === RIGHT && y > 0)
            return map[x][y - 1];
    } else if (dir === EAST) {
        if (toward === AHEAD && y < height - 1)
            return map[x][y + 1];
        else if (toward === LEFT && x > 0)
            return map[x - 1][y];
        else if (toward === RIGHT && x < width - 1)
            return map[x + 1][y];
    } else if (dir === WEST) {
        if (toward === AHEAD && y > 0)
            return map[x][y - 1];
        else if (toward === LEFT && x < width - 1)
            return map[x + 1][y];
        else if (toward === RIGHT && x > 0)
            return map[x - 1][y];
    }

    return undefined;
}

function move_ahead(dir, pos) {
    let x = pos["x"];
    let y = pos["y"];

    if (dir === NORTH)
        return {"x": x - 1, "y": y};
    else if (dir === SOUTH)
        return {"x": x + 1, "y": y};
    else if (dir === EAST)
        return {"x": x, "y": y + 1};
    else if (dir === WEST)
        return {"x": x, "y": y - 1};
    else
        return undefined;
}

function turn(dir, toward) {
    if (dir === NORTH) {
        if (toward === LEFT)
            return WEST;
        else if (toward === RIGHT)
            return EAST;
    } else if (dir === SOUTH) {
        if (toward === LEFT)
            return EAST;
        else if (toward === RIGHT)
            return WEST;
    } else if (dir === EAST) {
        if (toward === LEFT)
            return NORTH;
        else if (toward === RIGHT)
            return SOUTH;
    } else if (dir === WEST) {
        if (toward === LEFT)
            return SOUTH;
        else if (toward === RIGHT)
            return NORTH;
    }

    return undefined;
}

const A = 0;
const B = 1;
const C = 2;
const MEM_LIMIT = 20 / 2;

function match(movements, start, funcs, last_func, output = undefined) {
    let found = true;

    while (found) {
        for (let f = 0; f <= last_func; f++) {
            found = true;
            for (let i = 0; i < funcs[f]["length"]; i++)
                if (movements[start + i] !== movements[funcs[f]["start"] + i]) {
                    found = false;
                    break;
                }
            if (found) {
                start += funcs[f]["length"];
                if (output !== undefined)
                    output.push(f);
                break;
            }
        }
    }

    return start;
}

function solve(input, part) {
    let program = input[0].split(',').map(x => Number(x));
    program["pc"] = 0;
    program["relative_base"] = 0;

    let map = [[]];
    let line = 0;
    while (true) {
        let output = run(program, []);
        if (output.length === 0)
            break;

        if (output[0] === NEWLINE) {
            map.push([]);
            line++;
        } else
            map[line].push(output[0]);
    }

    //show_map(map);

    if (part === 1) {
        let sum = 0;
        for (i = 1; i < map.length - 1; i++)
            for (j = 1; j < map[i].length - 1; j++)
                if (map[i][j] === SCAFFOLD
                    && map[i - 1][j] === SCAFFOLD
                    && map[i + 1][j] === SCAFFOLD
                    && map[i][j - 1] === SCAFFOLD
                    && map[i][j + 1] === SCAFFOLD)
                    sum += i * j;
        console.log(`Sum of alignment: ${sum}`);
        return sum;
    }

    /* Find the movements

       By looking at the map with our human eyes, we find if robot do as below:

         * if there is scaffold ahead,  it always goes straight
         * otherwise it turns to left or right if that direction is scaffold
         * when no scaffold ahead, left, or right, it reaches the end

       it can visit all scaffolds.
     */

    /* locate the robot */

    let pos = {"x": undefined, "y": undefined}; // current location of robot
    let dir; // current direction of robot
    for (i = 0; i < map.length; i++)
        for (j = 0; j < map[i].length; j++)
            if (map[i][j] === NORTH
                || map[i][j] === SOUTH
                || map[i][j] === WEST
                || map[i][j] === EAST) {
                pos["x"] = i;
                pos["y"] = j;
                dir = map[i][j];
            }

    let movements = [];
    let straight_steps = 0;
    while (true) {
        if (look(map, pos, dir, AHEAD) === SCAFFOLD) {
            straight_steps++;
            pos = move_ahead(dir, pos);
            continue;
        } else if (straight_steps > 0) {
            movements.push(straight_steps);
            //process.stdout.write(straight_steps + ",");
            straight_steps = 0;
        }
            
        if (look(map, pos, dir, LEFT) === SCAFFOLD) {
            dir = turn(dir, LEFT); 
            movements.push(LEFT);
            //process.stdout.write("L,");
        } else if (look(map, pos, dir, RIGHT) === SCAFFOLD) {
            dir = turn(dir, RIGHT); 
            movements.push(RIGHT);
            //process.stdout.write("R,");
        } else {
            //process.stdout.write("\n");
            break;
        }
    }

    let funcs = [{"start": 0, "length": 1},
                 {"start": 0, "length": 0},
                 {"start": 0, "length": 0}];
    let next = 0;
    let found = false;

    /* find A, B, C which can cover movements */
outer:
    while (funcs[A]["start"] + funcs[A]["length"] <= movements.length
           && funcs[A]["length"] <= MEM_LIMIT) {
        next += funcs[A]["length"];
        /* match A until cannot */
        //console.log("New A");
        //console.log(funcs);
        //console.log("try from " + next);
        next = match(movements, next, funcs, A);
        //console.log("  matched A until " + next);

        if (next === movements.length) {
            found = true;
            break outer;
        }

        /* set initial B */
        funcs[B]["start"] = next;
        funcs[B]["length"] = 1;
    
        while (funcs[B]["start"] + funcs[B]["length"] <= movements.length
               && funcs[B]["length"] <= MEM_LIMIT) {
            next += funcs[B]["length"];
            /* match A or B until cannot */
            //console.log("New B");
            //console.log(funcs);
            //console.log("try from " + next);
            next = match(movements, next, funcs, B);
            //console.log("  matched A or B until " + next);

            if (next === movements.length) {
                found = true;
                break outer;
            }

            /* set initial C */
            funcs[C]["start"] = next;
            funcs[C]["length"] = 1;

            while (funcs[C]["start"] + funcs[C]["length"] <= movements.length
                   && funcs[C]["length"] <= MEM_LIMIT) {
                next += funcs[C]["length"];
                /* match A or B or C until cannot */
                //console.log("New C");
                //console.log(funcs);
                //console.log("try from " + next);
                next = match(movements, next, funcs, C);
                //console.log("  matched A or B or C until " + next);

                if (next === movements.length) {
                    found = true;
                    break outer;
                }

                funcs[C]["length"]++;
                next = funcs[C]["start"];
            }

            funcs[B]["length"]++;
            next = funcs[B]["start"];
        }

        funcs[A]["length"]++;
        next = funcs[A]["start"];
    }

    if (!found) {
        console.log("Not found!");
        return undefined;
    }

    let main_routine = [];
    match(movements, 0, funcs, C, main_routine);

    /* create input */
    let ascii_input = [];

    for (let i = 0; i < main_routine.length; i++) {
        ascii_input.push(65 /* A */ + main_routine[i]);
        if (i === main_routine.length - 1)
            ascii_input.push(10); /* new line */
        else
            ascii_input.push(44); /* , */
    }

    for (let f = 0; f < funcs.length; f++) {
        let start = funcs[f]["start"];
        let length = funcs[f]["length"];
        for (let i = 0; i < length; i++) {
            if (i % 2 === 0)
                /* L or R */
                ascii_input.push(movements[start + i]);
            else {
                /* steps */
                let steps_digits = movements[start + i].toString().split('').map(Number);
                for (j = 0; j < steps_digits.length; j++)
                    ascii_input.push(48 /* 0 */ + steps_digits[j]);
            }
            if (i === length - 1)
                ascii_input.push(10); // new line
            else
                ascii_input.push(44); // ,
        }
    }


    program = input[0].split(',').map(x => Number(x));
    program["pc"] = 0;
    program["relative_base"] = 0;
    /* wake up robot */
    program[0] = 2;

    let output_buffer = [];
    let ascii_index = 0;
    let output = 0;
    let input_rules = false;
    let asking_feed = false;
    /* wait for a very large number */
    while (output[0] === undefined || output[0] < 1000) {
        if (!input_rules && !asking_feed)
            output = run(program, []);
        else if (asking_feed) {
            output = run(program, [110, 10]); // n
            input_feed = false;
        } else {
            //console.log("[in]" + ascii_input[ascii_index]);
            output = run(program, [ascii_input[ascii_index]]);
            if (ascii_input[ascii_index] === 10)
                input_rules = false;
            ascii_index++;
        }

        if (output.length === 0)
            continue;

        output_buffer.push(output[0])

        //console.log("[out]" + output[0], String.fromCharCode(output[0]));

        if (output[0] === 10) {
            let last_output = output_buffer.slice(-6);
            //console.log(last_output);

            /* FIXME why this does not work???
            if (last_output.map(String.fromCharCode).join('').indexOf("Main:") >= 0)
            */
            if (last_output[0] === 77           // M
                && last_output[1] === 97        // a
                && last_output[2] === 105       // i
                && last_output[3] === 110       // n
                && last_output[4] === 58        // :
                && last_output[5] === 10)       // new line
                input_rules = true;

            if (last_output[0] === 111          // o
                && last_output[1] === 110       // n 
                && last_output[2] === 32        // ' ' 
                && (last_output[3] === 65       // A
                    || last_output[3] === 66    // B
                    || last_output[3] === 67)   // C
                && last_output[4] === 58        // :
                && last_output[5] === 10)       // new line
                input_rules = true;

            if (last_output[0] === 102          // f
                && last_output[1] === 101       // e
                && last_output[2] === 101       // e
                && last_output[3] === 100       // d
                && last_output[4] === 63        // ?
                && last_output[5] === 10)       // new line
                asking_feed = true;
        }
            
    }

    return output[0];
}

const expected = part => part === 1 ? 9876: 1234055;

module.exports = {solve,expected};
