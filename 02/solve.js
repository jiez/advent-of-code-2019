function run(program) {
    let pc = 0;
    const ADD = 1;
    const MULT = 2;
    const STOP = 99;

    while (program[pc] !== STOP)
    {
        let a0 = program[pc + 1]; // address for op0
        let a1 = program[pc + 2]; // address for op1
        let a2 = program[pc + 3]; // address for result

        if (program[pc] === ADD)
        {
            program[a2] = program[a0] + program[a1];
            pc += 4;
        }
        else if (program[pc] === MULT)
        {
            program[a2] = program[a0] * program[a1];
            pc += 4;
        }
        else
        {
            console.log(`unknown opcode ${program[pc]} @ ${pc}`);
            pc += 1;
            return -1;
        }
    }

    return program[0];
}

function solve(input, part) {
    if (part === 1)
    {
        let program = input[0].split(',').map(x => Number(x));
        program[1] = 12;
        program[2] = 2;
        return run(program);
    }
    else
    {
        let noun;
        let verb;
        let found = false;

        for (noun = 0; noun <= 99; noun++)
        {
            for (verb = 0; verb <= 99; verb++)
            {
                let program = input[0].split(',').map(x => Number(x));
                program[1] = noun;
                program[2] = verb;
                let result = run(program);
                if (result === 19690720)
                {
                    found = true;
                    break;
                }
            }
            if (found)
                break;
        }
        if (found)
        {
            console.log(`noun = ${noun} verb = ${verb}`);
            return 100 * noun + verb;
        }
        else
        {
            console.log("not found a pair of noun and verb for 19690720");
            return -1;
        }
    }
}

const expected = part => part === 1 ? 4570637 : 5485;

module.exports = {solve,expected};
