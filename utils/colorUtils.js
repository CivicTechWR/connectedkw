export function hashStringToSeed(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}

export function seededRandom(seed) {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function getRandomColor(skillName) {
    const seed = hashStringToSeed(skillName);

    const baseRed = 216;
    const baseGreen = 31;
    const baseBlue = 91;
    const diff = 50;

    const redVariation = Math.floor(seededRandom(seed) * diff * 2 - diff);
    const greenVariation = Math.floor(seededRandom(seed + 1) * diff * 2 - diff);
    const blueVariation = Math.floor(seededRandom(seed + 2) * diff * 2 - diff);

    const red = Math.min(Math.max(baseRed + redVariation, 0), 255);
    const green = Math.min(Math.max(baseGreen + greenVariation, 0), 255);
    const blue = Math.min(Math.max(baseBlue + blueVariation, 0), 255);

    return `rgb(${red}, ${green}, ${blue})`;
}
  