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

function solve(input, part) {
    let program = input[0].split(',').map(x => Number(x));
    program["pc"] = 0;
    program["relative_base"] = 0;
    let line;

    line = [];
    while (true) {
        let output = run(program, []);
        if (output.length === 0)
            break;
        else if (output[0] === 10) {
            console.log(line.join(""));
            line.length = 0;
        } else if (output[0] <= 255)
            line.push(String.fromCharCode(output[0]));
    };

    /* we need to jump holes like this

.................
.................
@................
#####..#.########
   ^   ^
NOT B AND D

.................
.................
@................
#####...#########
    ^
NOT A

.................
.................
@................
#####.#..########
  ^   ^
NOT C AND D AND H
            ~~~~~ only for part 2

Additional case for part 2
.................
.................
@................
#####.#.##..#.###
    ^   ^   ^


    NOT A OR (NOT B AND D) OR (NOT C AND D AND H)
                                           ~~~~~ only for part 2

    */

    if (part === 1)
        script = [
            // NOT A
            "NOT A J",
            // OR (NOT B AND D)
            "NOT B T",
            "AND D T",
            "OR T J",
            // OR (NOT C AND D)
            "NOT C T",
            "AND D T",
            "OR T J",
            "WALK"
        ];
    else
        script = [
            // NOT A
            "NOT A J",
            // OR (NOT B AND D)
            "NOT B T",
            "AND D T",
            "OR T J",
            // OR (NOT C AND D AND H)
            "NOT C T",
            "AND D T",
            "AND H T",
            "OR T J",
            "RUN"
        ];

    for (i = 0; i < script.length; i++) {
        console.log(script[i]);
        let output = run(program, script[i].split('').map(s => s.charCodeAt(0)).concat([10]));
        if (output.length > 0)
            console.log(String.fromCharCode(output[0]));
    }

    line = [];
    while (true) {
        let output = run(program, []);
        if (output.length === 0)
            break;
        else if (output[0] === 10) {
            console.log(line.join(""));
            line.length = 0;
        } else if (output[0] <= 255)
            line.push(String.fromCharCode(output[0]));
        else {
            console.log(`Damage: ${output[0]}`);
            return output[0];
        }
    };
}

const expected = part => part === 1 ? 19355364 : 1142530574;

module.exports = {solve,expected};
