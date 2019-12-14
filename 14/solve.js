const util = require('util');

function solve(input, part) {
    let reactions = new Map();
    let chemicals = new Map(); // chemcial => {"products", "amount"}
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
                chemicals.set(source["chemical"], {"products": new Set(), "amount": 0});
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

    // calculate the amount in the partial order
    chemicals.set("FUEL", {"products": new Set(), "amount": 1});

    for (let i = 0; i < partial_order.length; i++) {
        let chemical = partial_order[i];
        let reaction = reactions.get(chemical);

        if (reaction === undefined)
            continue;

        let amount = chemicals.get(chemical)["amount"];
        let n = Math.ceil(amount / reaction["units"]);

        reaction["sources"].forEach(source => {
            chemicals.get(source.chemical)["amount"] += source.units * n;
        });
    }

    //console.log(util.inspect(chemicals, {depth: 3, colors: true}));

    return chemicals.get("ORE")["amount"];
}


const expected = part => part === 1 ? 387001 : 0;

module.exports = {solve,expected};
