declare module 'flubber' {
  export interface FlubberOptions {
    maxSegmentLength?: number;
    single?: boolean;
  }

  export function interpolate(
    fromShape: string | [number, number][],
    toShape: string | [number, number][],
    options?: FlubberOptions
  ): (t: number) => string;

  export function toCircle(
    fromShape: string | [number, number][],
    x: number,
    y: number,
    r: number,
    options?: FlubberOptions
  ): (t: number) => string;

  export function fromCircle(
    x: number,
    y: number,
    r: number,
    toShape: string | [number, number][],
    options?: FlubberOptions
  ): (t: number) => string;

  export function separate(
    fromShape: string | [number, number][],
    toShapeList: (string | [number, number][])[],
    options?: FlubberOptions
  ): (t: number) => string | string[];

  export function combine(
    fromShapeList: (string | [number, number][])[],
    toShape: string | [number, number][],
    options?: FlubberOptions
  ): (t: number) => string | string[];
}
