function calculate_one_phase(signal) {
    let output = [];

    for (let i = 0; i < signal.length; i++) {
        let stepsize = i + 1;
        let result = 0;

        for (let j = stepsize - 1; j < signal.length; j += stepsize * 4)
            for (let k = j; k < j + stepsize && k < signal.length; k++)
                result += signal[k];

        for (let j = stepsize * 3 - 1; j < signal.length; j += stepsize * 4)
            for (let k = j; k < j + stepsize && k < signal.length; k++)
                result -= signal[k];

        output[i] = Math.abs(result) % 10;
    }

    return output;
}

function solve(input, part) {
    let signal = input[0].split('').map(Number);
    const phases = 100;

    for (let i = 0; i < phases; i++)
        signal = calculate_one_phase(signal);

    return signal.slice(0, 8).join('');
}


const expected = part => part === 1 ? "84970726" : 0;

module.exports = {solve,expected};
