function parse_input(input) {
    let deal_into_new_stack = function(num_of_cards, dummy, pos) {
        return num_of_cards - 1 - pos;
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

       
    let shuffles = [];
    for (line of input) {
        if (line.includes("new")) {
            //console.log("deal into new stack");
            shuffles.push({func: deal_into_new_stack, anti_func: deal_into_new_stack});
        } else if (line.includes("increment")) {
            let increment = parseInt(line.match(/-?[0-9]+/)[0]);
            //console.log(`deal with increment ${increment}`);
            shuffles.push({func: deal_with_increment, anti_func: anti_deal_with_increment, param: increment});
        } else if (line.includes("cut")) {
            let index = parseInt(line.match(/-?[0-9]+/)[0]);
            //console.log(`cut ${index}`);
            shuffles.push({func: cut, anti_func: anti_cut, param: index});
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

function solve(input, part) {
    let shuffles = parse_input(input);

    if (part === 1) {
        const num_of_cards = 10007;
        let initial_pos = 2019;
        return transform(shuffles, num_of_cards, initial_pos);
    } else {
        //const num_of_cards = 119315717514047;
        //const times = 101741582076661;
        //let end_pos = 2020;
        const num_of_cards = 10007;
        const times = 1;
        let end_pos = 8191;

        let first_repeat = 0;
        let pos = end_pos;
        for (i = 0; i < times; i++) {
            pos = anti_transform(shuffles, num_of_cards, pos);
        }

        console.log(`card ${end_pos} as at ${pos} before ${times} times of shuffling`);
        return pos;
    }
}


const expected = part => part === 1 ? 8191 : 0;

module.exports = {solve,expected};
