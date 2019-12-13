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
                if (output.length === 3) {
                    program["pc"] = pc;
                    break outer;
                }
                break;

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

const TILE_EMPTY   = 0;
const TILE_WALL    = 1;
const TILE_BLOCK   = 2;
const TILE_HPADDLE = 3;
const TILE_BALL    = 4;

function show_screen(screen)
{
    let max_x = screen.length;

    let max_y = 0;
    for (i = 0; i < screen.length; i++)
        if (max_y < screen[i].length)
            max_y = screen[i].length;

    process.stdout.write("Screen\n");

    for (j = 0; j < max_y; j++) {
        for (i = 0; i < max_x; i++) {
            let tile = screen[i][j];
            if (i === screen["target_x"] && j === screen["target_y"]) {
                if (tile === TILE_HPADDLE)
                    process.stdout.write("@");
                else if (tile === TILE_EMPTY)
                    process.stdout.write("*");
                else
                    process.stdout.write("?");
                continue;
            }

            if (tile === TILE_EMPTY || tile === undefined)
                process.stdout.write(" ");
            else if (tile === TILE_WALL)
                process.stdout.write("W");
            else if (tile === TILE_BLOCK)
                process.stdout.write("#");
            else if (tile === TILE_HPADDLE)
                process.stdout.write("=");
            else if (tile === TILE_BALL)
                process.stdout.write("o");
            else
                process.stdout.write("?");
        }
        process.stdout.write("\n");
    }

    process.stdout.write("\n");
}

function init_screen(program) {
    program["pc"] = 0;
    program["relative_base"] = 0;
    let tiles = [];

    while (true) {
        let output = run(program, []);
        if (output.length === 0)
            break;
        tiles.push(output[0]);
        tiles.push(output[1]);
        tiles.push(output[2]);
    }

    let screen = [];
    for (i = 0; i < tiles.length; i += 3) {
        let x = tiles[i];
        let y = tiles[i + 1];
        let tile = tiles[i + 2];

        if (screen[x] === undefined)
            screen[x] = [];

        if (screen[x][y] !== undefined)
            console.log(`(${x},${y}) already has ${tile}`);

        screen[x][y] = tile;
    }

    return screen;
}

function solve(input, part) {
    let program = input[0].split(',').map(x => Number(x));
    let screen = init_screen(program);
    let block_count = 0;
    let ball = {x: 0, y: 0};
    let hpad = {x: 0, y: 0};
    let left_wall = 0;
    let right_wall = 0;

    for (x = 0; x < screen.length; x++)
        for (y = 0; y < screen.length; y++)
            if (screen[x][y] === TILE_BLOCK)
                block_count++;
            else if (screen[x][y] === TILE_BALL) {
                ball.x = x;
                ball.y = y;
            } else if (screen[x][y] === TILE_HPADDLE) {
                hpad.x = x;
                hpad.y = y;
            } else if (screen[x][y] === TILE_WALL) {
                if (right_wall < x)
                    right_wall = x;
            }

    let width = right_wall - left_wall - 1;
    let height = hpad.y - 1;

    //show_screen(screen);

    if (part === 1)
        return block_count;

    // insert coins;
    program[0] = 2;
    screen = init_screen(program);

    let output;
    let move;
    let target_x; // the target ball x value
    let final_score = false;
    while (!final_score) {
        // initially we just keep still and observe the direction of ball
        if (output === undefined)
            move = 0;

        output = run(program, [move]);

        let x = output[0];
        let y = output[1];
        let tile = output[2];

        if (x === -1 && y === 0) {
            score = tile;
            //console.log(`Score: ${score}`);
            if (block_count === 0)
                final_score = true;
        }

        // a block is broken
        if (screen[x][y] === TILE_BLOCK && tile !== TILE_BLOCK)
            block_count--;

        // update screen
        screen[x][y] = tile;

        if (tile === TILE_BALL) {
            // calculate hpaddle target position when ball is moving down
            if (y > ball.y) {
                if (x < ball.x)
                    target_x = x - (hpad.y - y - 1);
                else
                    target_x = x + (hpad.y - y - 1);

                while (target_x <= left_wall || target_x >= right_wall) {
                    if (target_x <= left_wall)
                        target_x = (left_wall + 1) + (left_wall + 1 - target_x);
                    else // target_x >= right_wall
                        target_x = (right_wall - 1) - (target_x - right_wall + 1);
                }

            // if ball is moving up, just follow it
            } else if (y < ball.y)
                target_x = x;

            if (hpad.x < target_x)
                move = 1;
            else if (hpad.x > target_x)
                move = -1;
            else
                move = 0;

            ball.x = x;
            ball.y = y;

            //console.log(`hpad: ${hpad.x} target: ${target_x}, move: ${move}`);
        } else if (tile === TILE_HPADDLE) {
            hpad.x = x;
            hpad.y = y;
        }

        screen["target_x"] = target_x;
        screen["target_y"] = hpad.y;
        //show_screen(screen);
    }

    return score;
}

const expected = part => part === 1 ? 255: 12338;

module.exports = {solve,expected};
