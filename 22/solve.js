function parse_input(input) {
    let deal_into_new_stack = function(num_of_cards, dummy, pos) {
        return num_of_cards - 1 - pos;
    };

    let combine_deal_into_new_stack = function(num_of_cards, dummy, params) {
        return [- params[0] - 1, - params[1]];
    };

    let deal_with_increment = function(num_of_cards, increment, pos) {
        return pos * increment % num_of_cards;
    };

    let anti_deal_with_increment = function(num_of_cards, increment, pos) {
        while (pos % increment !== 0) {
            pos += num_of_cards;
        }

        return pos / increment;
    }

    let combine_deal_with_increment = function(num_of_cards, increment, params) {
        return [params[0] * increment % num_of_cards, params[1] * increment % num_of_cards];
    };

    let cut = function(num_of_cards, index, pos) {
        let new_pos = pos - index;

        if (new_pos >= num_of_cards)
            return new_pos % num_of_cards;
        while (new_pos < 0)
            new_pos += num_of_cards;

        return new_pos;
    };

    let anti_cut = function(num_of_cards, index, pos) {
         let prev_pos = pos + index;

        if (prev_pos >= num_of_cards)
            return prev_pos % num_of_cards;
        while (prev_pos < 0)
            prev_pos += num_of_cards;

        return prev_pos;
    };

    let combine_cut = function(num_of_cards, index, params) {
        return [params[0] - index, params[1]];
    }
       
    let shuffles = [];
    for (line of input) {
        if (line.includes("new")) {
            //console.log("deal into new stack");
            shuffles.push({func: deal_into_new_stack, anti_func: deal_into_new_stack, combine_func: combine_deal_into_new_stack});
        } else if (line.includes("increment")) {
            let increment = parseInt(line.match(/-?[0-9]+/)[0]);
            //console.log(`deal with increment ${increment}`);
            shuffles.push({func: deal_with_increment, anti_func: anti_deal_with_increment, combine_func: combine_deal_with_increment, param: increment});
        } else if (line.includes("cut")) {
            let index = parseInt(line.match(/-?[0-9]+/)[0]);
            //console.log(`cut ${index}`);
            shuffles.push({func: cut, anti_func: anti_cut, combine_func: combine_cut, param: index});
        }
    }

    return shuffles;
}

function transform(shuffles, num_of_cards, pos) {
    for (let i = 0; i < shuffles.length; i++)
        pos = shuffles[i].func(num_of_cards, shuffles[i].param, pos);
    return pos;
}

function anti_transform(shuffles, num_of_cards, pos) {
    for (let i = shuffles.length - 1; i >= 0; i--)
        pos = shuffles[i].anti_func(num_of_cards, shuffles[i].param, pos);
    return pos;
}

function combine_transform(shuffles, num_of_cards, initial_params) {
    let params = initial_params;
    for (let i = 0; i < shuffles.length; i++)
        params = shuffles[i].combine_func(num_of_cards, shuffles[i].param, params);
    return params;
}

function combine_two(num_of_cards, params1, params2) {
    let a = BigInt(params1[1]);
    let b = BigInt(params1[0]);
    let c = BigInt(params2[1]);
    let d = BigInt(params2[0]);
    return [Number((b * c + d) % BigInt(num_of_cards)), Number((a * c) % BigInt(num_of_cards))];
}

function solve(input, part) {
    let shuffles = parse_input(input);

    if (part === 1) {
        const num_of_cards = 10007;
        let initial_pos = 2019;
        return transform(shuffles, num_of_cards, initial_pos);
        /*
        // another way to calculate it
        let params = combine_transform(shuffles, num_of_cards, [0, 1]);
        let result = (initial_pos * params[1] + params[0]) % num_of_cards;
        if (result < 0)
            result += num_of_cards;
        return result;
        */
    } else {
        // for small data we can use the above anti_funcs to calculate it.
        // but for large repeat times, the following method will be more
        // efficient. 
        const num_of_cards = 119315717514047;
        const total_times = 101741582076661;
        const end_pos = 2020;
        let initial_params = combine_transform(shuffles, num_of_cards, [0, 1]);
        let times = total_times;
        let final_params;

        while (times > 0) {
            let count = 1;
            params = initial_params;
            while (count * 2 <= times) {
                params = combine_two(num_of_cards, params, params);
                //params = combine_double(num_of_cards, params);
                count *= 2;
            }

            if (final_params === undefined)
                final_params = params;
            else
                final_params = combine_two(num_of_cards, final_params, params);

            // console.log(final_params);

            times -= count;
        }

        let original_pos;
        // naive way
        /*
        let i = 0;
        while ((i * final_params[1] + final_params[0] - end_pos) % num_of_cards !== 0)
            i++;
        original_pos = i;
        */
        // mathmetical way i.e. wolframalpha way ;)
        let a = final_params[1];
        let b = final_params[0];
        // find x for
        //   a * x + b === end_pos MOD num_of_cards
        // i.e.
        //   a * x === c MOD num_of_cards (c = end_pos - b) 
        // we use wolframalpha.com to solve it for now.
        let c = end_pos - b;
        console.log("Find the solution for this equation on www.wolframalpha.com:");
        console.log(`${a} x = ${c} MOD ${num_of_cards}`);
        /* solution: x congruent 1644352419829 (mod 119315717514047) */
        /*
        console.log(`card ${end_pos} as at ${original_pos} before ${total_times} times of shuffling`);
        return original_pos;
        */
    }
}


const expected = part => part === 1 ? 8191 : 0;

module.exports = {solve,expected};
