function solve(input, part) {
    const mass2fuel = (mass) => Math.floor(mass / 3) - 2;
    const mass2fuelfuel = (mass) => {
        let fuel = mass2fuel(mass);
        let total_fuel = fuel;
        while (1)
        {
            morefuel = mass2fuel(fuel);
            if (morefuel > 0)
            {
                fuel = morefuel;
                total_fuel += fuel;
            }
            else
                break;
        }
        return total_fuel;
    };
    return fuel_for_all_modules(input, part === 1 ? mass2fuel : mass2fuelfuel);
}

function fuel_for_all_modules(mass_of_modules, fn) {
    return mass_of_modules.map(m => fn(m)).reduce((a, c) => a + c);
}

const expected = part => part === 1 ? 3412094 : 5115267;

module.exports = {solve,expected};
