function add_orbit(orbits, objects, orbit) {
    objs = orbit.split(')');
    orbits.set(objs[1], objs[0]);
    objects.add(objs[0]);
    objects.add(objs[1]);
}

function calculate_orbit_layer(object, orbits, layers) {
    if (layers.has(object))
        return layers.get(object);
    else if (object === "COM") {
        layers.set(object, 0);
        return 0;
    } else {
        let layer = calculate_orbit_layer(orbits.get(object), orbits, layers) + 1;
        layers.set(object, layer);
        return layer;
    }
}

function solve(input, part) {
    let orbits = new Map();
    let objects = new Set();
    let layers = new Map();

    input.map(x => add_orbit(orbits, objects, x));

    for (let object of objects)
        if (!layers.has(object))
            calculate_orbit_layer(object, orbits, layers);

    let direct_orbits = 0;
    let indirect_orbits = 0;
    for (let object of objects)
        if (object !== "COM") {
            direct_orbits++;
            indirect_orbits += layers.get(object) - 1;
        }

    let total_orbits = direct_orbits + indirect_orbits;
    console.log(`direct: ${direct_orbits} indirect: ${indirect_orbits} total: ${total_orbits}`);

    if (part === 1)
        return total_orbits;

    let obj;
    let sans_obitting_objects = new Set();

    obj = 'SAN';
    do {
        obj = orbits.get(obj);
        sans_obitting_objects.add(obj);
    } while (obj !== 'COM');

    // find the first object both 'YOU' and 'SAN' are orbitting
    obj = 'YOU';
    do {
        obj = orbits.get(obj);
        if (sans_obitting_objects.has(obj))
            break;
    } while (obj !== 'COM');

    let transfers = layers.get('SAN') + layers.get('YOU') - layers.get(obj) * 2 - 2;

    console.log(`first common object: ${obj} transfers: ${transfers}`);

    return transfers;
}


const expected = part => part === 1 ? 140608 : 337;

module.exports = {solve,expected};
