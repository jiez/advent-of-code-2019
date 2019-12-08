function solve(input, part) {
    let image = input[0];
    const width = 25;
    const height = 6;
    const size = 25 * 6;
    const num_of_layers = image.length / size;

    if (part === 1) {

    let fewest_zeroes = size;
    let layer_of_fewest_zeroes;

    for (let i = 0; i < num_of_layers; i++) {
        let num_of_zeroes = 0;
        for (let j = i * size; j < (i + 1) * size; j++)
            if (image[j] === '0')
                num_of_zeroes++;
        if (num_of_zeroes < fewest_zeroes) {
            fewest_zeroes = num_of_zeroes;
            layer_of_fewest_zeroes = i;
        }
    }

    let num_of_ones = 0;
    let num_of_twoes = 0;
    i = layer_of_fewest_zeroes;
    for (let j = i * size; j < (i + 1) * size; j++)
        if (image[j] === '1')
            num_of_ones++;
        else if (image[j] === '2')
            num_of_twoes++;

    console.log(`Layer of fewest 0s: ${i} , ${fewest_zeroes} 0s, ${num_of_ones} 1s, ${num_of_twoes} 2s`);

    return num_of_ones * num_of_twoes;

    } else {

    let final_image = new Array(size);

    for (let i = num_of_layers - 1; i >= 0; i--) {
        for (let j = 0; j < size; j++) {
            let color = image[i * size + j];
            if (color === '0' || color === '1')
                final_image[j] = color;
        }
    }

    /* '0' is black '1' is white. make '0' be 'black' on black background */
    for (let j = 0; j < size; j++)
        if (final_image[j] === '0')
            final_image[j] = ' ';

    for (let i = 0; i < height; i++)
        console.log(final_image.slice(i * width, (i + 1) * width).join(''));

    return 0;

    }
}


const expected = part => part === 1 ? 1064 : 0;

module.exports = {solve,expected};
