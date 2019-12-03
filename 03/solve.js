function limitof(line) {
    let x = 0, y = 0;
    let minx = 0, miny = 0, maxx = 0, maxy = 0;

    for (segment of line) {
        switch (segment[0]) {
            case 'U':
                y += parseInt(segment.slice(1), 10);
                if (y > maxy)
                    maxy = y;
                break;
            case 'D':
                y -= parseInt(segment.slice(1), 10);
                if (y < miny)
                    miny = y;
                break;
            case 'L':
                x -= parseInt(segment.slice(1), 10);
                if (x < minx)
                    minx = x;
                break;
            case 'R':
                x += parseInt(segment.slice(1), 10);
                if (x > maxx)
                    maxx = x;
                break;
            default:
                /* ignore */
        }
    }

    return [minx, maxx, miny, maxy];
}

function mark(grid, x, y, id, steps) {
    if (grid[x][y] === undefined)
        grid[x][y] = {};
    if (grid[x][y][id] === undefined)
        grid[x][y][id] = steps;
}

function wire(grid, centralx, centraly, line, id) {
    let x = centralx, y = centraly;
    let newx, newy;
    let steps = 1;

    for (segment of line) {
        switch (segment[0]) {
            case 'U':
                newy = y + parseInt(segment.slice(1), 10);
                for (let i = y + 1; i <= newy; i++) {
                    mark(grid, x, i, id, steps);
                    steps++;
                }
                y = newy;
                break;
            case 'D':
                newy = y - parseInt(segment.slice(1), 10);
                for (let i = y - 1; i >= newy; i--) {
                    mark(grid, x, i, id, steps);
                    steps++;
                }
                y = newy;
                break;
            case 'L':
                newx = x - parseInt(segment.slice(1), 10);
                for (let i = x - 1; i >= newx; i--) {
                    mark(grid, i, y, id, steps);
                    steps++;
                }
                x = newx;
                break;
            case 'R':
                newx = x + parseInt(segment.slice(1), 10);
                for (let i = x + 1; i <= newx; i++) {
                    mark(grid, i, y, id, steps);
                    steps++;
                }
                x = newx;
                break;
            default:
                /* ignore */
        }
    }
}

function find_closest(grid, centralx, centraly, max) {
    let closest = max;
    let closestx = 0, closesty = 0;

    for ([x, row] of grid.entries()) {
        for ([y, value] of row.entries()) {
            if (value && value[1] !== undefined && value[2] !== undefined) {
                let distance = Math.abs(x - centralx) + Math.abs(y - centraly);
                if (distance < closest && distance !== 0) {
                    closest = distance;
                    closestx = x;
                    closesty = y;
                }
            }
        }
    }
    return [closestx, closesty, closest];
}

function find_least_steps(grid) {
    let least_steps = -1;
    let leastx = 0, leasty = 0;

    for ([x, row] of grid.entries()) {
        for ([y, value] of row.entries()) {
            if (value && value[1] !== undefined && value[2] !== undefined) {
                let steps = value[1] + value[2];
                if (steps === 0)
                    continue;
                if (least_steps === -1 || steps < least_steps) {
                    least_steps = steps;
                    leastx = x;
                    leasty = y;
                }
            }
        }
    }
    return [leastx, leasty, least_steps];
}


function solve(input, part) {
    let line0 = input[0].split(',');
    let line1 = input[1].split(',');
    let [minx0, maxx0, miny0, maxy0] = limitof(line0);
    let [minx1, maxx1, miny1, maxy1] = limitof(line1);
    let minx = minx0 < minx1 ? minx0 : minx1;
    let maxx = maxx0 > maxx1 ? maxx0 : maxx1;
    let miny = miny0 < miny1 ? miny0 : miny1;
    let maxy = maxy0 > maxy1 ? maxy0 : maxy1;
    let lengthx = maxx - minx + 1;
    let lengthy = maxy - miny + 1;
    let centralx = 0;
    let centraly = 0;

    /* adjust central port coordinate */

    if (minx < 0)
        centralx = - minx;
    if (miny < 0)
        centraly = - miny;

    /* define a map large enough to hold the two lines */

    let grid = [];
    for (let i = 0; i < lengthx; i++) {
        grid.push([]);
    }

    wire(grid, centralx, centraly, line0, 1);
    wire(grid, centralx, centraly, line1, 2);

    if (part === 1) {
        let [x, y, closest] = find_closest(grid, centralx, centraly, maxx - minx + maxy - miny);

        console.log(`clostest: x = ${x}, y = ${y}, distance = ${closest}`);
        return closest;
    } else {
        let [x, y, least_steps] = find_least_steps(grid);
        console.log(`least steps: x = ${x}, y = ${y}, steps = ${least_steps}`);
        return least_steps;
    }
}


const expected = part => part === 1 ? 1084 : 9240;

module.exports = {solve,expected};
