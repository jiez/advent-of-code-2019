const chalk = require('chalk');
const fs = require('fs');

let startDay = 1;
let endDay = 25;
const args = process.argv.slice(2);
for(let arg of args) {
    const n = Number(arg);
    if (n > 0) {
        startDay = n;
        endDay = n;
    }
}

const timed = fn => {
    const start = process.hrtime();
    const output = fn();
    const [secs,nanosecs] = process.hrtime(start);
    const ms = Math.floor(nanosecs/1000000);
    return [output, secs, ms];
}

const showTestResult = (day, part, expected, actual, secs, ms) => {
    const durationDesc = chalk.blue(` (${secs}s${ms}ms)`);
    if (actual === expected) {
        console.log(chalk.green(`day ${day} part ${part}: ${actual}`) + durationDesc);
    }
    else {
        console.log(chalk.red(`day ${day} part ${part}: ${actual} - expected ${expected}` + durationDesc));
    }
}

for(let day = startDay; day <= endDay; day++) {
    const path = `./${("0" + day).slice(-2)}`;
    if (!fs.existsSync(path)) {
        console.log(chalk.red(`day ${day} not found`));
        continue;
    }
    const solver = require(path +`/solve`);
    const input = fs.readFileSync(path + `/input`)
                    .toString()
                    .split('\n')
                    .map(s => s.replace(/\r$/, ''))
                    .filter(s => s.length > 0);
    for(let part of [1,2]) {
        const expected = solver.expected(part);
        const [answer,secs,ms] = timed(() => solver.solve(input, part));
        showTestResult(day, part, expected, answer, secs, ms);
    }
}
