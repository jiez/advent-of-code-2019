const STOP_STOP = 0;
const STOP_INPUT = 1;
const STOP_OUTPUT = 2;
const STOP_ERROR = 3;

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

function run(program, input, output) {
    let pc = program["pc"];
    let input_index = 0;

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

    let stop_status = STOP_STOP;

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
                if (input.length === 0) {
                    program["pc"] = pc;
                    stop_status = STOP_INPUT;
                    break outer;
                }
                program[addr] = input.shift();
                pc += 2;
                break;

            case OUTPUT:
                a0 = program[pc + 1];
                mode0 = Math.trunc(program[pc] / 100) % 10;
                result = operand(program, a0, mode0);
                output.push(result);
                pc += 2;
                program["pc"] = pc;
                stop_status = STOP_OUTPUT;
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
                stop_status = STOP_ERROR;
                break outer;
        }
    }

    return stop_status;
}

// We will create 50 programs, each has its input, output
// {program: , input: , output: }

function solve(input, part) {
    let machines = [];
    const NUM_OF_MACHINES = 50;

    for (let i = 0; i < NUM_OF_MACHINES; i++) {
        machines.push({program: input[0].split(',').map(x => Number(x)),
                       input_buf: [],
                       output_buf: [],
                       stat: undefined});
        machines[i].program["pc"] = 0;
        machines[i].program["relative_base"] = 0;
    }

    // assign address
    for (let i = 0; i < NUM_OF_MACHINES; i++)
        machines[i].stat = run(machines[i].program, [i], machines[i].output_buf);

    let stop = false;
    let first_packet_for_address_255_reported = false;
    let first_packet_for_address_255_y;
    let nat_buf = [];
    let nat_last_sent_y;
    let idle = 0;
    while (!stop) {
        for (let i = 0; i < NUM_OF_MACHINES; i++) {
            idle++;
            if (machines[i].stat === STOP_INPUT) {
                let machine_input = [];
                if (machines[i].input_buf.length === 0)
                    machine_input.push(-1);
                else {
                    machine_input.push(machines[i].input_buf.shift());
                    idle = 0;
                }
                machines[i].stat = run(machines[i].program, machine_input, machines[i].output_buf);
            } else if (machines[i].stat === STOP_OUTPUT) {
                idle = 0;
                //console.log(i, machines[i].output_buf);
                machines[i].stat = run(machines[i].program, [], machines[i].output_buf);
                if (machines[i].output_buf.length === 3) {
                    let target = machines[i].output_buf.shift();
                    let x = machines[i].output_buf.shift();
                    let y = machines[i].output_buf.shift();

                    if (target >= 0 && target < NUM_OF_MACHINES) {
                        machines[target].input_buf.push(x);
                        machines[target].input_buf.push(y);
                    }

                    if (target === 255) {
                        if (!first_packet_for_address_255_reported) {
                            console.log(`Y value of the first packet sent to address 255: ${y}`);
                            first_packet_for_address_255_y = y;
                            first_packet_for_address_255_reported = true;
                        }
                        nat_buf[0] = x;
                        nat_buf[1] = y;
                    }
                }
            }

            // if we have idle for 10 loops
            if (idle >= 50 * 10 && nat_buf[1] !== undefined) {
                if (nat_last_sent_y === nat_buf[1]) {
                    console.log(`The first Y value from NAT to 0 twice in a row: ${nat_last_sent_y}`);
                    stop = true;
                }

                //console.log("From NAT to address 0: " + nat_buf);
                machines[0].input_buf.push(nat_buf[0]);
                machines[0].input_buf.push(nat_buf[1]);
                nat_last_sent_y = nat_buf[1];
                nat_buf.length = 0;
            }
        }
    }

    if (part === 1)
        return first_packet_for_address_255_y;
    else
        return nat_last_sent_y;
}

const expected = part => part === 1 ? 20764 : 14805;

module.exports = {solve,expected};
