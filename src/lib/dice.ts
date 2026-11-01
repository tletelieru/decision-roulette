export type Vec = [number, number, number];
export type Quat = [number, number, number, number];

export type Face = { points: number[]; center: Vec; normal: Vec; up: Vec; value: number };

export type Solid = { vertices: Vec[]; faces: Face[] };

const PHI = (1 + Math.sqrt(5)) / 2;
const REST_TILT = { x: 0.42, y: -0.34 };
const STRIDE: Record<number, number> = { 4: 1, 6: 5, 8: 3, 12: 5, 20: 7 };

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec, b: Vec): Vec => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a: Vec, s: number): Vec => [a[0] * s, a[1] * s, a[2] * s];
export const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const length = (a: Vec) => Math.sqrt(dot(a, a));
export const normalize = (a: Vec): Vec => scale(a, 1 / length(a));
export const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const mean = (points: Vec[]) =>
  scale(points.reduce(add, [0, 0, 0] as Vec), 1 / points.length);

function axisAngle(axis: Vec, angle: number): Quat {
  const s = Math.sin(angle / 2);
  return [Math.cos(angle / 2), axis[0] * s, axis[1] * s, axis[2] * s];
}

export { axisAngle };

export function multiply(a: Quat, b: Quat): Quat {
  return [
    a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3],
    a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2],
    a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1],
    a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0],
  ];
}

export function rotate(q: Quat, v: Vec): Vec {
  const axis: Vec = [q[1], q[2], q[3]];
  const t = scale(cross(axis, v), 2);
  return add(add(v, scale(t, q[0])), cross(axis, t));
}

const conjugate = (q: Quat): Quat => [q[0], -q[1], -q[2], -q[3]];

function triangles(vertices: Vec[]): number[][] {
  const distance = (a: number, b: number) => length(sub(vertices[a], vertices[b]));
  let edge = Infinity;
  vertices.forEach((_, a) => {
    for (let b = a + 1; b < vertices.length; b += 1) edge = Math.min(edge, distance(a, b));
  });
  const close = (a: number, b: number) => Math.abs(distance(a, b) - edge) < 1e-6;
  const faces: number[][] = [];
  for (let a = 0; a < vertices.length; a += 1) {
    for (let b = a + 1; b < vertices.length; b += 1) {
      for (let c = b + 1; c < vertices.length; c += 1) {
        if (close(a, b) && close(b, c) && close(a, c)) faces.push([a, b, c]);
      }
    }
  }
  return faces;
}

function dual(vertices: Vec[], faces: number[][]) {
  const centers = faces.map((face) => normalize(mean(face.map((index) => vertices[index]))));
  const rings = vertices.map((vertex, index) => {
    const ring = faces.flatMap((face, position) => (face.includes(index) ? [position] : []));
    const first = sub(centers[ring[0]], scale(vertex, dot(centers[ring[0]], vertex)));
    const e1 = normalize(first);
    const e2 = cross(vertex, e1);
    const angle = (position: number) =>
      Math.atan2(dot(centers[position], e2), dot(centers[position], e1));
    return ring.sort((a, b) => angle(a) - angle(b));
  });
  return { vertices: centers, faces: rings };
}

function finish(rawVertices: Vec[], faces: number[][], sides: number): Solid {
  const vertices = rawVertices.map(normalize);
  return {
    vertices,
    faces: faces.map((face, index) => {
      const corners = face.map((point) => vertices[point]);
      const center = mean(corners);
      const flipped =
        dot(cross(sub(corners[1], corners[0]), sub(corners[2], corners[0])), center) < 0;
      const points = flipped ? [...face].reverse() : face;
      const a = vertices[points[0]];
      const b = vertices[points[1]];
      const anchor = face.length === 4 ? scale(add(a, b), 0.5) : a;
      return {
        points,
        center,
        normal: normalize(center),
        up: normalize(sub(anchor, center)),
        value: ((index * STRIDE[sides]) % sides) + 1,
      };
    }),
  };
}

function buildSolid(sides: number): Solid {
  const tetra: Vec[] = [
    [1, 1, 1],
    [1, -1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
  ];
  const octa: Vec[] = [
    [1, 0, 0],
    [-1, 0, 0],
    [0, 1, 0],
    [0, -1, 0],
    [0, 0, 1],
    [0, 0, -1],
  ];
  const icosa = (
    [
      [0, 1, PHI],
      [0, 1, -PHI],
      [0, -1, PHI],
      [0, -1, -PHI],
      [1, PHI, 0],
      [1, -PHI, 0],
      [-1, PHI, 0],
      [-1, -PHI, 0],
      [PHI, 0, 1],
      [PHI, 0, -1],
      [-PHI, 0, 1],
      [-PHI, 0, -1],
    ] as Vec[]
  ).map(normalize);
  if (sides === 4) return finish(tetra, triangles(tetra), 4);
  if (sides === 6) {
    const cube = dual(octa, triangles(octa));
    return finish(cube.vertices, cube.faces, 6);
  }
  if (sides === 8) return finish(octa, triangles(octa), 8);
  if (sides === 12) {
    const dodeca = dual(icosa, triangles(icosa));
    return finish(dodeca.vertices, dodeca.faces, 12);
  }
  return finish(icosa, triangles(icosa), 20);
}

const cache = new Map<number, Solid>();

export function solidFor(sides: number): Solid {
  const solid = cache.get(sides) ?? buildSolid(sides);
  cache.set(sides, solid);
  return solid;
}

export function facingRotation(face: Face): Quat {
  const toward: Vec = [0, 0, 1];
  const axis = cross(face.normal, toward);
  const first =
    length(axis) < 1e-6
      ? face.normal[2] > 0
        ? ([1, 0, 0, 0] as Quat)
        : axisAngle([1, 0, 0], Math.PI)
      : axisAngle(normalize(axis), Math.acos(Math.min(1, Math.max(-1, face.normal[2]))));
  const up = rotate(first, face.up);
  return multiply(axisAngle(toward, Math.atan2(up[0], up[1])), first);
}

export function restingRotation(solid: Solid, value: number): Quat {
  const face = solid.faces.find((item) => item.value === value) ?? solid.faces[0];
  const amount = solid.faces.length === 20 ? 0.6 : 1;
  const tilt = multiply(
    axisAngle([1, 0, 0], REST_TILT.x * amount),
    axisAngle([0, 1, 0], REST_TILT.y * amount),
  );
  return multiply(tilt, facingRotation(face));
}

export type Roll = { end: Quat; axis: Vec; angle: number; wobble: Vec; wobbleTurns: number };

export function planRoll(from: Quat, end: Quat, turns: number, wobble: Vec): Roll {
  const delta = multiply(conjugate(end), from);
  const w = Math.min(1, Math.max(-1, delta[0]));
  const raw: Vec = [delta[1], delta[2], delta[3]];
  const axis: Vec = length(raw) < 1e-6 ? [0, 1, 0] : normalize(raw);
  return {
    end,
    axis,
    angle: 2 * Math.acos(w) + turns * Math.PI * 2,
    wobble,
    wobbleTurns: Math.max(1, turns - 1),
  };
}

export function rollAt(roll: Roll, progress: number): Quat {
  const left = (1 - progress) ** 3;
  return multiply(
    multiply(roll.end, axisAngle(roll.axis, roll.angle * left)),
    axisAngle(roll.wobble, roll.wobbleTurns * Math.PI * 2 * left),
  );
}
