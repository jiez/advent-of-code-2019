function meet_criteria_1(n) {
    let digits = n.toString();
    let have_double_digits = false;
    let never_decrease = true;
    for (let i = 0; i < digits.length - 1; i++) {
        if (digits[i] === digits[i + 1])
            have_double_digits = true; 

        if (digits[i] > digits[i + 1]) {
            never_decrease = false;
            break;
        }
    }

    return have_double_digits && never_decrease;
}

function meet_criteria_2(n) {
    let digits = n.toString();
    let have_double_digits = false;
    let never_decrease = true;

    for (let i = 0; i < digits.length - 1; i++) {
        if (digits[i] > digits[i + 1]) {
            never_decrease = false;
            break;
        }
    }

    if (!never_decrease)
        return false;

    for (let i = 0; i < digits.length - 1; i++) {
        if (i === 0) {
            if (digits[i] === digits[i + 1] && digits[i] !== digits[i + 2]) {
                have_double_digits = true;
                break;
            }
        } else if (i === digits.length - 2) {
            if (digits[i] === digits[i + 1] && digits[i] !== digits[i - 1]) {
                have_double_digits = true; 
                break;
            }
        } else {
            if (digits[i] === digits[i + 1]
                && digits[i] !== digits[i - 1]
                && digits[i] !== digits[i + 2]) {
                have_double_digits = true; 
                break;
            }
        }
    }

    return have_double_digits;
}

function solve(input, part) {
    let range = input[0].split('-').map(x => Number(x));
    let start = range[0];
    let end = range[1];
    let count = 0;

    for (let i = start; i <= end; i++)
        if (part === 1 && meet_criteria_1(i))
            count++;
        else if (part === 2 && meet_criteria_2(i))
            count++;

    return count;
}


const expected = part => part === 1 ? 1169 : 757;

module.exports = {solve,expected};
