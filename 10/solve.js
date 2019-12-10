function angle_and_distance(asteroids, i, j) {
    let x = asteroids[j].x - asteroids[i].x;
    let y = asteroids[j].y - asteroids[i].y;
    let d = Math.sqrt(x * x + y * y);

    /* For the 2nd part, the laser is turning clockwisely from
       12 o'clock on the map. So we are calculating the angle from Y axis
       instead of X axis.

       Also note Y axis is pointing downward while X axis is pointing right.
       So we need negate y and negate angle plus 2 PI. */

    let a = Math.acos((- y) / d);
    if (x < 0)
        a = Math.PI * 2 - a;
    return [a, d];
}

function adjust_asteroids(asteroids, angle, map) {
    asteroids.sort(function (a, b) {
        if (a["d"] < b["d"])
            return -1;
        if (a["d"] > b["d"])
            return 1;

        return 0;
    });

    for (let i = 1; i < asteroids.length; i++)
        asteroids[i]["a"] += Math.PI * 2 * i;
}
 
function solve(input, part) {
    let asteroids = [];
    for (let i = 0; i < input.length; i++)
        for (let j = 0; j < input[i].length; j++)
            if (input[i][j] === '#')
                asteroids.push({x: j, y: i});

    for (let i = 0; i < asteroids.length; i++) {
        let visible = new Set();
        for (let j = 0; j < asteroids.length; j++) {
            if (i === j)
                continue;
            let result = angle_and_distance(asteroids, i, j);
            visible.add(result[0].toPrecision(14));
        }
        asteroids[i]["visible"] = visible.size;
    }

    let max_visible = 0;
    let best_x, best_y, best_i;
    for (let i = 0; i < asteroids.length; i++) {
        if (max_visible < asteroids[i]["visible"]) {
            max_visible = asteroids[i]["visible"];
            best_x = asteroids[i].x;
            best_y = asteroids[i].y;
            best_i = i;
        }
    }

    console.log(`Best is (${best_x},${best_y}) with ${max_visible} other asteroids detected`);

    if (part === 1)
        return max_visible;

    /* cover is a map from angle to an array of asteroids of that angle */
    let cover = new Map();
    for (let i = 0; i < asteroids.length; i++) {
        if (i === best_i) {
            asteroids[i]["a"] = -1;
            continue;
        }

        let result = angle_and_distance(asteroids, best_i, i);
        let a = result[0];
        let d = result[1];
        asteroids[i]["a"] = a;
        asteroids[i]["d"] = d;
        a = a.toPrecision(14);
        if (cover.has(a))
            cover.get(a).push(asteroids[i]);
        else
            cover.set(a, [asteroids[i]]);
    }

    /* if there are more than 1 asteroids for an angle, sort asteroids by
       distance and add 2PI to 2nd one, 4PI to 3rd one, ... */
    cover.forEach(adjust_asteroids);

    /* sort asteroids by angle */
    asteroids.sort(function (a, b) {
        if (Number(a["a"].toPrecision(14)) < Number(b["a"].toPrecision(14)))
            return -1;
        if (Number(a["a"].toPrecision(14)) > Number(b["a"].toPrecision(14)))
            return 1;

        return 0;
    });

    let x_200th = asteroids[200]["x"];
    let y_200th = asteroids[200]["y"];
    console.log(`The 200th asteroid to be vaporized is at (${x_200th},${y_200th}).`);
    console.log(x_200th * 100 + y_200th);

    return x_200th * 100 + y_200th;
}


const expected = part => part === 1 ? 309 : 416;

module.exports = {solve,expected};
