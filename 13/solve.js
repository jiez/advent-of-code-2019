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
/*
function show_panels(panels, width, height)
{
    let min_x = width, max_x = 0, min_y = height, max_y = 0;
    const WHITE = 1;

    // first narrow down the ranges
    for (i = 0; i < panels.length; i++)
        for (j = 0; j < panels[i].length; j++)
            if (panels[i][j] === WHITE) {
                if (i < min_x) min_x = i;
                if (i > max_x) max_x = i;
                if (j < min_y) min_y = j;
                if (j > max_y) max_y = j;
            }

    process.stdout.write("Panels\n");

    for (i = min_x; i <= max_x; i++)
        process.stdout.write("=");
    process.stdout.write("\n");

    for (j = min_y; j <= max_y; j++) {
        for (i = min_x; i <= max_x; i++)
            if (panels[i][j] === 1)
                process.stdout.write("#");
            else
                process.stdout.write(" ");
        process.stdout.write("\n");
    }

    for (i = min_x; i <= max_x; i++)
        process.stdout.write("=");
    process.stdout.write("\n");
}
*/

const TILE_EMPTY   = 0;
const TILE_WALL    = 1;
const TILE_BLOCK   = 2;
const TILE_HPADDLE = 3;
const TILE_BALL    = 4;

function solve(input, part) {
    let program = input[0].split(',').map(x => Number(x));

    program["pc"] = 0;
    program["relative_base"] = 0;

    let tiles = run(program, []);

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

    let block_count = 0;
    for (x = 0; x < screen.length; x++)
        for (y = 0; y < screen.length; y++)
            if (screen[x][y] === TILE_BLOCK)
                block_count++;

    return block_count;
}

const expected = part => part === 1 ? 255: 0;

module.exports = {solve,expected};
