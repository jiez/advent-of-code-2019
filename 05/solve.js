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
    let pc = 0;
    let input_index = 0;
    const ADD = 1;
    const MULT = 2;
    const INPUT = 3;
    const OUTPUT = 4;
    const JUMP_IF_TRUE = 5;
    const JUMP_IF_FALSE = 6;
    const LESS_THAN = 7;
    const EQUALS = 8;
    const STOP = 99;

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
                console.log(`${result}`);
                pc += 2;
                break;

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
                return -1;
        }
    }

    return 0;
}

function solve(input, part) {
    let program = input[0].split(',').map(x => Number(x));
    if (part === 1)
        return run(program, [1]);
    else
        return run(program, [5]);
}

const expected = part => part === 1 ? 0 : 0;

module.exports = {solve,expected};
