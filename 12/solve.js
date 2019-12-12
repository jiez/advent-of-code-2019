function total_energy(moons) {
    /* FIXME why this does not work???
    return moons.reduce((a, m) => {
        return a
               + m.get("pos").map(Math.abs).reduce((x, y) => x + y)
               + m.get("vel").map(Math.abs).reduce((x, y) => x + y);
    });
    */
    let total = 0;
    for (let m = 0; m < moons.length; m++) {
        let pot = 0, kin = 0;

        let pos = moons[m].get("pos");
        for (let i = 0; i < pos.length; i++)
            pot += Math.abs(pos[i]);

        let vel = moons[m].get("vel");
        for (let i = 0; i < vel.length; i++)
            kin += Math.abs(vel[i]);

        total += pot * kin;
    }

    return total;
}

function solve(input, part) {
    let moons = [];
    for (let i = 0; i < input.length; i++) {
        moons[i] = new Map();
        moons[i].set("pos", input[i].match(/-?\d+/g).map(Number));
        moons[i].set("vel", [0, 0, 0]);
    }

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

    console.log(moons);

    return total;
}


const expected = part => part === 1 ? 11384 : 0;

module.exports = {solve,expected};
