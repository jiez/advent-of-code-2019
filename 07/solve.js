function operand(program, value, mode)
{
    const POS_MODE = 0;
    const IMM_MODE = 1;

    if (mode === POS_MODE)
        return program[value];
    else if (mode === IMM_MODE)
        return value;
    else
        console.log(`unknown mode ${mode}`);
        return 0;
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
    const STOP = 99;

outer:
    while (program[pc] !== STOP) {
        let opcode = program[pc] % 100;
        let a0, a1, a2;
        let mode0, mode1;
        let result;

        switch (opcode) {
            case INPUT:
                a0 = program[pc + 1];
                program[a0] = input[input_index];
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

                if (opcode === ADD)
                    program[a2] = operand(program, a0, mode0) + operand(program, a1, mode1);
                else
                    program[a2] = operand(program, a0, mode0) * operand(program, a1, mode1);
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

                if (operand(program, a0, mode0) < operand(program, a1, mode1))
                    program[a2] = 1;
                else 
                    program[a2] = 0;
                pc += 4;

                break;

            case EQUALS:
                a0 = program[pc + 1];
                a1 = program[pc + 2];
                a2 = program[pc + 3];
                mode0 = Math.trunc(program[pc] / 100) % 10;
                mode1 = Math.trunc(program[pc] / 1000) % 10;

                if (operand(program, a0, mode0) === operand(program, a1, mode1))
                    program[a2] = 1;
                else 
                    program[a2] = 0;
                pc += 4;

                break;

            default:
                console.log(`unknown opcode ${program[pc]} @ ${pc}`);
                pc += 1;
                break outer;
        }
    }

    return output;
}

function solution_1(input) {
    let program;
    let output;
    let largest_output = 0;
    let best_a, best_b, best_c, best_d, best_e;

    for (let phase_a = 0; phase_a <= 4; phase_a++)
        for (let phase_b = 0; phase_b <= 4; phase_b++) {
            if (phase_b === phase_a)
                continue;

            for (let phase_c = 0; phase_c <= 4; phase_c++) {
                if (phase_c === phase_a || phase_c === phase_b)
                    continue;

                for (let phase_d = 0; phase_d <= 4; phase_d++) {
                    if (phase_d === phase_a || phase_d === phase_b
                        || phase_d === phase_c)
                        continue;

                    for (let phase_e = 0; phase_e <= 4; phase_e++) {
                        if (phase_e === phase_a || phase_e === phase_b
                            || phase_e === phase_c || phase_e == phase_d)
                            continue;

                        /* Amp A */
                        program = input[0].split(',').map(x => Number(x));
                        program["pc"] = 0;
                        output = run(program, [phase_a, 0]);

                        /* Amp B */
                        program = input[0].split(',').map(x => Number(x));
                        program["pc"] = 0;
                        output = run(program, [phase_b, output[0]]);

                        /* Amp C */
                        program = input[0].split(',').map(x => Number(x));
                        program["pc"] = 0;
                        output = run(program, [phase_c, output[0]]);

                        /* Amp D */
                        program = input[0].split(',').map(x => Number(x));
                        program["pc"] = 0;
                        output = run(program, [phase_d, output[0]]);

                        /* Amp E */
                        program = input[0].split(',').map(x => Number(x));
                        program["pc"] = 0;
                        output = run(program, [phase_e, output[0]]);

                        if (output[0] > largest_output) {
                            largest_output = output[0];
                            best_a = phase_a;
                            best_b = phase_b;
                            best_c = phase_c;
                            best_d = phase_d;
                            best_e = phase_e;
                        }
                    }
                }
            }
        }

    console.log(`MAX OUTPUT: ${largest_output} when [${best_a}, ${best_b}, ${best_c}, ${best_d}, ${best_e}]`);

    return largest_output;
}

function solution_2(input) {
    let output;
    let largest_output = 0;
    let best_a, best_b, best_c, best_d, best_e;

    for (let phase_a = 5; phase_a <= 9; phase_a++)
        for (let phase_b = 5; phase_b <= 9; phase_b++) {
            if (phase_b === phase_a)
                continue;

            for (let phase_c = 5; phase_c <= 9; phase_c++) {
                if (phase_c === phase_a || phase_c === phase_b)
                    continue;

                for (let phase_d = 5; phase_d <= 9; phase_d++) {
                    if (phase_d === phase_a || phase_d === phase_b
                        || phase_d === phase_c)
                        continue;

                    for (let phase_e = 5; phase_e <= 9; phase_e++) {
                        if (phase_e === phase_a || phase_e === phase_b
                            || phase_e === phase_c || phase_e == phase_d)
                            continue;

                        let program_a = input[0].split(',').map(x => Number(x));
                        let program_b = input[0].split(',').map(x => Number(x));
                        let program_c = input[0].split(',').map(x => Number(x));
                        let program_d = input[0].split(',').map(x => Number(x));
                        let program_e = input[0].split(',').map(x => Number(x));
                        let input_a = [phase_a, 0];
                        let input_b = [phase_b];
                        let input_c = [phase_c];
                        let input_d = [phase_d];
                        let input_e = [phase_e];

                        program_a["pc"] = 0;
                        program_b["pc"] = 0;
                        program_c["pc"] = 0;
                        program_d["pc"] = 0;
                        program_e["pc"] = 0;

                        let last_output;

                        while (true) {
                            /* Amp A */
                            output = run(program_a, input_a);
                            input_a = [];
                            if (output.length === 0)
                                break;
                            else
                                input_b.push(output[0]);

                            /* Amp B */
                            output = run(program_b, input_b);
                            input_b = [];
                            if (output.length === 0)
                                break;
                            else
                                input_c.push(output[0]);

                            /* Amp C */
                            output = run(program_c, input_c);
                            input_c = [];
                            if (output.length === 0)
                                break;
                            else
                                input_d.push(output[0]);

                            /* Amp D */
                            output = run(program_d, input_d);
                            input_d = [];
                            if (output.length === 0)
                                break;
                            else
                                input_e.push(output[0]);

                            /* Amp E */
                            output = run(program_e, input_e);
                            input_e = [];
                            if (output.length === 0)
                                break;
                            else {
                                input_a.push(output[0]);
                                last_output = output[0];
                            }
                        }

                        if (last_output > largest_output) {
                            largest_output = last_output;
                            best_a = phase_a;
                            best_b = phase_b;
                            best_c = phase_c;
                            best_d = phase_d;
                            best_e = phase_e;
                        }
                    }
                }
            }
        }

    console.log(`MAX OUTPUT: ${largest_output} when [${best_a}, ${best_b}, ${best_c}, ${best_d}, ${best_e}]`);

    return largest_output;
}


function solve(input, part) {
    if (part === 1)
        return solution_1(input);
    else
        return solution_2(input);
}

const expected = part => part === 1 ? 398674 : 39431233;

module.exports = {solve,expected};
