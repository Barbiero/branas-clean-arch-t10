type Coord = {
  lat: number;
  long: number;
};

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default class DistanceCalculator {
  static calculate(from: Coord, to: Coord) {
    if (from.lat == to.lat && from.long == to.long) return 0;

    const R = 6371; // Earth's radius in kilometers
    const dLat = deg2rad(to.lat - from.lat);
    const dLon = deg2rad(to.long - from.long);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(from.lat)) *
        Math.cos(deg2rad(to.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
