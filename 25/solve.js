const util = require('util');

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

function run_commands(program, commands, output) {
    let stat;

    for (command of commands) {
        //console.log(`send command ${command}`);

        let input_buf = command.split('').map(s => s.charCodeAt(0)).concat([10]);
        let output_buf = [];

        stat = run(program, input_buf, output_buf);

        while (stat === STOP_OUTPUT) {
            stat = run(program, [], output_buf);
        }

        let output_lines = output_buf.map(c => String.fromCharCode(c)).join('');
        //console.log(output_lines);
        output.push(output_lines);
    }

    return stat;   
}

function parse_output_lines(output_lines) {
    let parse_regex = /== (?<name>.*) ==\n(?<description>.*)\n\n(Doors here lead:\n(?<doors>(- .*\n)*))?\n(Items here:\n(?<items>(- .*\n)*))?/;
    let parsed = output_lines.match(parse_regex);
    //console.log(parsed);

    if (parsed !== null && parsed.groups !== null) {
        let groups = parsed.groups;

        if (groups.doors !== undefined)
            doors = groups.doors.split("\n").filter(x => x.length > 0).map(x => x.slice(2));
        let items;
        if (groups.items != undefined)
            items = groups.items.split("\n").filter(x => x.length > 0).map(x => x.slice(2));

        //console.log(groups.name, doors, items);
        return {name: groups.name, description: groups.description, doors: doors, items: items};
    }

}

function back_command(cmd) {
    if (cmd === "east")
        return "west";
    else if (cmd === "west")
        return "east";
    else if (cmd === "north")
        return "south";
    else if (cmd === "south")
        return "north";
    else {
        console.log(`Unknown command "${cmd}"`);
        return undefined;
    }
}

function find_path(graph, start, end)
{
    let paths = new Map();
    let edge = new Set();

    paths.set(start, []);
    edge.add(start);

    while(edge.size > 0 && !paths.has(end)) {
        let new_edge = new Set();

        for (place of edge) {
            graph.get(place).leads.forEach((place_name, door, dummy) => {
                if (!paths.has(place_name)) {
                    paths.set(place_name, paths.get(place).concat(door));
                    new_edge.add(place_name);
                }
            });
        }

        edge = new_edge;
    }

    if (paths.has(end))
        return paths.get(end);
    else
        return undefined;
}

function solve(input, part) {
    if (part === 2)
        return 0;

    let program = input[0].split(',').map(x => Number(x));
    program["pc"] = 0;
    program["relative_base"] = 0;

    // path is an array of {place_name: , current_door: }
    let path = [];
    let depth = 0;

    // graph is a Map,
    //   place_name => {description: , doors: [], leads: { door => place_name }, items: []}
    // leads is a Map from door to place name which it leads to
    // if the door exists but has not been explored, it is null 
    let graph = new Map();

    // record the places we have visited
    //let visited_places = new Set();

    let input_buf = [];
    let output_buf = [];
    let output_lines;
    let backing = false;
    while (true) {
        let stat = run(program, input_buf, output_buf);

        if (stat === STOP_OUTPUT) {
        } else if (stat === STOP_INPUT) {
            output_lines = output_buf.map(c => String.fromCharCode(c)).join('');
            //console.log(output_lines);
            output_buf.length = 0;

            let place = parse_output_lines(output_lines);

            //console.log(place);

            // if this is the first time we visit this place
            if (!graph.has(place.name)) {
                // add it to the graph
                //console.log(`This is the first time visiting ${place.name}, adding it to graph`);
                //console.log("before " + util.inspect(graph, {depth: 4, colors: false}));
                graph.set(place.name, {description: place.description,
                    doors: place.doors, leads: new Map(), items: place.items});

                if (depth > 0) {
                    let prev_place = graph.get(path[depth - 1].place_name);
                    prev_place.leads.set(prev_place.doors[path[depth - 1].current_door], place.name);
                    graph.get(place.name).leads.set(back_command(command), path[depth - 1].place_name);
                }
                //console.log("after " + util.inspect(graph, {depth: 4, colors: false}));

                if (output_lines.includes("ejected back to the checkpoint")) {
                    // this is a hack
                    //console.log("ejected back to the checkpoint");
                    backing = true;
                    command = "south";
                    depth--;
                    depth--;
                } else {
                    // add it to the path
                    //console.log("adding it to path")
                    //console.log("before " + util.inspect(path, {depth: 4, colors: false}));
                    path[depth] = {place_name: place.name, current_door: 0};
                    //console.log("after " + util.inspect(path, {depth: 4, colors: false}));

                    // next command
                    command = graph.get(path[depth].place_name).doors[path[depth].current_door];

                    depth++;
                }
            } else if (backing && path[depth].current_door < graph.get(path[depth].place_name).doors.length - 1) {
                path[depth].current_door++;
                backing = false;
                command = graph.get(path[depth].place_name).doors[path[depth].current_door];
                depth++;
                //console.log(`backing and choose the next door ${command}`);
            } else {
                // not backing but we have been this place before
                // or we are backing but we have tried all doors
                // either case we need back to the place of previous depth

                //console.log(`not backing or no next door to choose`);

                if (depth === 0) {
                    //console.log("All places have been explored!");
                    //console.log(util.inspect(graph, {depth: 4, colors: false}));
                    break;
                }

                //console.log("backing");

                depth--;
                //console.log(util.inspect(path, {depth: 4, colors: false}));
                //console.log(`depth: ${depth}`);

                let previous_cmd = graph.get(path[depth].place_name).doors[path[depth].current_door];
                command = back_command(previous_cmd);
                backing = true;

                //console.log(`backing using command ${command}`);
            }

            input_buf = command.split('').map(s => s.charCodeAt(0)).concat([10]);
            //console.log(`send command ${command}`);
        }
    }

    // create a list of items
    let items = [];
    graph.forEach((place, place_name, dummy) => {
        if (place.items !== undefined)
            place.items.forEach(item => {
                if (item !== "infinite loop"
                    && item !== "giant electromagnet"
                    && item !== "photons"
                    && item !== "escape pod"
                    && item !== "molten lava")
                    items.push({name: item, place: place_name});
            });
    });

    //console.log(items);

    // now we have a map and we are at the "Hull Breach" again
    let current_place = path[depth].place_name;
    //console.log(`we are at ${current_place} now`);

    let commands = [];
    let output = [];

    // we first move all items to security checkpoint
    for (item of items) {
        // calculate a path from the current place to the place of item
        path = find_path(graph, current_place, item.place);
        //console.log(path);
        // go to the place of item
        commands = commands.concat(path);

        // take the item
        commands.push("take " + item.name);

        // calculate a path from the place of item to "Security Checkpoint"
        path = find_path(graph, item.place, "Security Checkpoint");
        //console.log(path);
        commands = commands.concat(path);

        // drop the item
        commands.push("drop " + item.name);

        current_place = "Security Checkpoint";
    }

    // execute
    run_commands(program, commands, output);

    path = find_path(graph, "Security Checkpoint", "Pressure-Sensitive Floor");

    let passed = false;
    let num_of_items = items.length;

    // try all combinations
    for (k = 1; k < (1 << num_of_items) - 1; k++) {
        let items_to_take = [];
        commands = [];
        output = [];

        for (i = 0; i < num_of_items; i++)
            if ((k & (1 << i)) !== 0)
                items_to_take.push(items[i]);

        // take the items
        items_to_take.forEach(item => {
            commands.push("take " + item.name);
        });

        // try to go to "Pressure-Sensitive Floor"
        commands = commands.concat(path);

        //console.log(commands);
        run_commands(program, commands, output);
        //console.log(output);

        // if not being ejected back, break
        if (! output[output.length - 1].includes("ejected back to the checkpoint")) {
            passed = true;
            break;
        }

        // otherwise we are at "Security Checkpoint"
        // drop the items we are carrying
        commands = [];
        items_to_take.forEach(item => {
            commands.push("drop " + item.name);
        });
        //console.log(commands);
        run_commands(program, commands, output);
        //console.log(output);
    }

    if (passed) {
        let passcode = output[output.length - 1].match(/typing (?<passcode>\d+)/).groups.passcode;
        return passcode
    } else
        console.log("Can't find a combination of items to pass the check!");
}

const expected = part => part === 1 ? "285213704" : 0;

module.exports = {solve,expected};
