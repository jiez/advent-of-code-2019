const util = require('util');

function produce_one_fuel(chemicals, reactions, partial_order) {
    // calculate the need in the partial order
    chemicals.set("FUEL", {"products": new Set(), "need": 1});

    for (let i = 0; i < partial_order.length; i++) {
        let chemical = partial_order[i];
        let reaction = reactions.get(chemical);

        if (reaction === undefined)
            continue;

        let need = chemicals.get(chemical)["need"];
        let n = Math.ceil(need / reaction["units"]);

        reaction["sources"].forEach(source => {
            chemicals.get(source.chemical)["need"] += source.units * n;
        });

        // if more than need, roll over the remaining to the next time
        chemicals.get(chemical)["need"] = need - n * reaction["units"];
    }

    let ore_need = chemicals.get("ORE")["need"];

    chemicals.get("ORE")["need"] = 0;

    return ore_need;
}

function solve(input, part) {
    let reactions = new Map();
    let chemicals = new Map(); // chemcial => {"products", "need"}
    let partial_order = [];

    input.map(line => {
        let reaction = line.split(' => ');
        let left = reaction[0].split(', ');
        let right = reaction[1].split(' ');
        let product_chemical = right[1];
        let product_units = Number(right[0]);
        let sources = [];
        for (let i = 0; i < left.length; i++) {
            let source = left[i].split(' ');
            sources.push({"chemical": source[1], "units": Number(source[0])});
        }
        reactions.set(product_chemical, {"units": product_units, "sources": sources});
    });

    //console.log(util.inspect(reactions, {depth: 3, colors: true}));

    reactions.forEach((value, key, map) => {
        value["sources"].forEach(source => {
            if (chemicals.get(source["chemical"]) === undefined)
                chemicals.set(source["chemical"], {"products": new Set(), "need": 0});
            chemicals.get(source["chemical"])["products"].add(key);
        });
    });

    //console.log(util.inspect(chemicals, {depth: 3, colors: true}));

    // sort chemicals in partial order
    let working_list = [];
    working_list.push("FUEL");

    while (working_list.length > 0) {
        let chemical = working_list.shift();
        let reaction = reactions.get(chemical);

        partial_order.push(chemical);

        // raw material does not need reaction
        if (reaction === undefined)
            continue;

        reaction["sources"].forEach(source => {
            let products = chemicals.get(source.chemical)["products"];
            products.delete(chemical);
            if (products.size === 0)
                working_list.push(source.chemical);
        });
    }

    //console.log(partial_order);

    ore_need = produce_one_fuel(chemicals, reactions, partial_order);

    if (part === 1)
        return ore_need;

    let num_of_ore = 1000000000000;
    let num_of_fuel = 0;

    while (num_of_ore >= ore_need) {
        num_of_fuel++;
        num_of_ore -= ore_need;
        ore_need = produce_one_fuel(chemicals, reactions, partial_order);
    }

    return num_of_fuel;
}


const expected = part => part === 1 ? 387001 : 3412429;

module.exports = {solve,expected};
