function total_energy(moons) {
    /* initialValue must be supplied when sum up an object array! */
    return moons.reduce((a, m) => {
        return a + m.get("pos").map(Math.abs).reduce((x, y) => x + y)
                   * m.get("vel").map(Math.abs).reduce((x, y) => x + y);
    }, 0);
}

function sim_1(moons) {
    for (let step = 1; step <= 1000; step++) {
        /* update vel */
        for (let m = 0; m < moons.length; m++)
            for (let n = m + 1; n < moons.length; n++)
                /* loop over x, y, z */
                for (let a = 0; a < 3; a++)
                    if (moons[m].get("pos")[a] < moons[n].get("pos")[a]) {
                        moons[m].get("vel")[a]++;
                        moons[n].get("vel")[a]--;
                    } else if (moons[m].get("pos")[a] > moons[n].get("pos")[a]) {
                        moons[m].get("vel")[a]--;
                        moons[n].get("vel")[a]++;
                    }

        /* update pos */
        for (let m = 0; m < moons.length; m++)
            for (let a = 0; a < 3; a++)
                moons[m].get("pos")[a] += moons[m].get("vel")[a];
    }

    total = total_energy(moons);

    console.log(`Total energy: ${total}`);

    //console.log(moons);

    return total;
}

function sim_one_dim(moons, dim) {
    let initial_pos = [];
    let pos = [];
    let vel = [];

    for (let m = 0; m < moons.length; m++) {
        initial_pos[m] = moons[m].get("pos")[dim];
        pos[m] = initial_pos[m];
        vel[m] = 0;
    }

    let same_status = false;
    let steps = 0;

    while (!same_status) {
        steps++;
        /* update vel */
        for (let m = 0; m < moons.length; m++)
            for (let n = m + 1; n < moons.length; n++)
                if (pos[m] < pos[n]) {
                    vel[m]++;
                    vel[n]--;
                } else if (pos[m] > pos[n]) {
                    vel[m]--;
                    vel[n]++;
                }

        /* update pos */
        for (let m = 0; m < moons.length; m++)
            pos[m] += vel[m];

        same_status = true;
        for (let m = 0; m < moons.length; m++)
            if (vel[m] !== 0 || pos[m] !== initial_pos[m]) {
                same_status = false;
                break;
            }
    }

    return steps;
}

function gcd(a, b) {
    let max, min;
    if (a > b) {
        max = a;
        min = b;
    } else {
        max = b;
        min = a;
    }

    if (max % min === 0)
        return min;
    else
        return gcd(max % min, min);
}

function lcm(a, b) {
    return a * b / gcd(a, b);
}

function sim_2(moons) {
    let results = [];

    /* The more efficient simulation is based on two observations:

       1. When reach the first state S that exactly matches a previous state T,
          T must be the initial state. Otherwise, S - 1 would match T - 1;
       2. Dimensions (x, y, z) do not affect each other. So we can simulate
          each of them separately. The answer will be the LCM of the steps of
          each dimension.
    */

    /* loop over x, y, z */
    for (a = 0; a < 3; a++)
        results[a] = sim_one_dim(moons, a);

    //console.log(results);

    return lcm(results[0], lcm(results[1], results[2]));
}

function solve(input, part) {
    let moons = [];
    for (let i = 0; i < input.length; i++) {
        moons[i] = new Map();
        moons[i].set("pos", input[i].match(/-?\d+/g).map(Number));
        moons[i].set("vel", [0, 0, 0]);
    }
    if (part === 1)
        return sim_1(moons);
    else
        return sim_2(moons);
}

const expected = part => part === 1 ? 11384 : 452582583272768;

module.exports = {solve,expected};
