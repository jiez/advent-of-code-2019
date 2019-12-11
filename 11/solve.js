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

function paint_panels(program, panels, initial_x, initial_y) {
    const BLACK = 0;
    const WHITE = 1;
    const LEFT = 0;
    const RIGHT = 1;

    program["pc"] = 0;
    program["relative_base"] = 0;
    let x = initial_x;
    let y = initial_y;
    let direction = [0, -1]; // initial direction is 'up'
    let output;

    //console.log(`start from (${x},${y})`);

    // run the program to paint
    while (true) {
        //console.log("");

        let color = panels[x][y];
        if (color === undefined)
            color = BLACK;

        output = run(program, [color]);
        if (output.length === 0)
            break;

        let new_color = output[0];
        panels[x][y] = new_color;

        //console.log(`paint (${x},${y}) ${color} => ${new_color}`);

        output = run(program, []);
        let turn = output[0];

        /* calculate the new direction

           turn left is
           |  0  1 |
           | -1  0 | x direction(T)

           turn right is
           |  0 -1 |
           |  1  0 | x direction(T)
        */
        if (turn === LEFT) {
            let dx = direction[0];
            let dy = direction[1];
            direction[0] = dy;
            direction[1] = - dx;
        } else if (turn === 1) {
            let dx = direction[0];
            let dy = direction[1];
            direction[0] = - dy;
            direction[1] = dx;
        } else {
            console.log(`unknown turn ${turn}`);
            return 0;
        }

        /* move one step on that direction */
        x += direction[0];
        y += direction[1];

        //console.log(`turn ${turn} => (${x},${y})`);

        if (x < 0)
            console.log("Panels is too narrow, make it wider and rerun.");
        if (y < 0)
            console.log("Panels is too short, make it higher and rerun.");
        if (x < 0 || y < 0)
            return 0;
    }
}

function solve(input, part) {
    let program = input[0].split(',').map(x => Number(x));
    const width = 200;
    const height = 200;
    let initial_x = width / 2;
    let initial_y = height / 2;

    let panels = [];
    for (i = 0; i < width; i++)
        panels.push([]);

    if (part === 2)
        panels[initial_x][initial_y] = 1;

    paint_panels(program, panels, initial_x, initial_y);

    if (part === 1) {
        // count painted panels
        let painted = 0;
        for (i = 0; i < panels.length; i++)
            for (j = 0; j < panels[i].length; j++)
                if (panels[i][j] !== undefined)
                    painted++;

        console.log(`The robot painted ${painted} panels at lease once.`);

        show_panels(panels, width, height);

        return painted;
    } else {
        show_panels(panels, width, height);
        return 0;
    }
}

const expected = part => part === 1 ? 2238: 0;

module.exports = {solve,expected};
