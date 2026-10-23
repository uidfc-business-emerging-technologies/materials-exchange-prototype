// Deterministic stand-ins for Tabbied designs (bloks, maze, trigram, metro, weave, terrain, comet, tesserae).
// The discipline picks the design and palette, the seed (resource ID) picks the arrangement,
// so the same resource always gets the same cover. Swap for <TabbiedPattern> when it is licensed.
import type { DisciplineKey } from "./data";

export type PatternKind = "bloks" | "maze" | "trigram" | "metro" | "weave" | "terrain" | "comet" | "tesserae";

/** Editorial direction: Illini neutrals with the discipline's signature color. */
export const PATTERN_MAP: Record<DisciplineKey, [PatternKind, string[]]> = {
  fin: ["bloks", ["#F4F4F4", "#13294B", "#FF5F05", "#FCB316"]],
  audit: ["maze", ["#F4F4F4", "#13294B", "#FF5F05", "#1D58A7"]],
  tax: ["trigram", ["#F4F4F4", "#13294B", "#FF5F05", "#7D3E13"]],
  ais: ["metro", ["#F4F4F4", "#13294B", "#FF5F05", "#009FD4", "#1D58A7"]],
  mgmt: ["weave", ["#F4F4F4", "#13294B", "#FF5F05", "#007E8E"]],
  data: ["terrain", ["#F4F4F4", "#13294B", "#FF5F05", "#006230"]],
  emtech: ["comet", ["#F4F4F4", "#13294B", "#FF5F05", "#5C0E41"]],
  other: ["tesserae", ["#F4F4F4", "#13294B", "#FF5F05", "#707372"]],
};

export const PATTERN_LABEL: Record<PatternKind, string> = {
  bloks: "Bloks", maze: "Maze", trigram: "Trigram", metro: "Metro", weave: "Weave", terrain: "Terrain", comet: "Comet", tesserae: "Tesserae",
};

/** Base cell size in px for the editorial direction. */
export const CELL = 28;

type Rand = () => number;

export function rng(seed: string): Rand {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const f = (n: number) => Math.round(n * 10) / 10;

/** Rounded square with per-corner radius [tl, tr, br, bl]. */
function rr(x: number, y: number, s: number, r: number[]) {
  const [tl, tr, br, bl] = r;
  return `M${f(x + tl)} ${f(y)}H${f(x + s - tr)}A${tr} ${tr} 0 0 1 ${f(x + s)} ${f(y + tr)}V${f(y + s - br)}A${br} ${br} 0 0 1 ${f(x + s - br)} ${f(y + s)}H${f(x + bl)}A${bl} ${bl} 0 0 1 ${f(x)} ${f(y + s - bl)}V${f(y + tl)}A${tl} ${tl} 0 0 1 ${f(x + tl)} ${f(y)}Z`;
}

/**
 * Each row draws from its own random stream, so a cell looks the same at any container width.
 * That keeps server-rendered covers stable when the browser re-measures them.
 */
type Gen = (w: number, h: number, c: number, ink: string[], RR: (row: number) => Rand, bg: string, clear: boolean) => string;

const GEN: Record<PatternKind, Gen> = {
  bloks(w, h, c, ink, RR) {
    let o = "";
    for (let y = 0, j = 0; y < h; y += c, j++)
      for (let x = 0, R = RR(j); x < w; x += c) {
        const t = Math.floor(R() * 6),
          k = Math.floor(R() * 4),
          s = c,
          hs = c / 2;
        let r = [0, 0, 0, 0];
        if (t < 2) r[k] = s;
        else if (t < 4) {
          r[k] = hs;
          r[(k + 1) % 4] = hs;
        } else if (t === 4) r = [hs, hs, hs, hs];
        o += `<path d="${rr(x, y, s, r)}" fill="${ink[Math.floor(R() * ink.length)]}"/>`;
      }
    return o;
  },
  maze(w, h, c, ink, RR) {
    const sw = f(c * 0.16);
    let o = `<g stroke-width="${sw}" stroke-linecap="round" fill="none">`;
    let d = "";
    for (let y = 0, j = 0; y < h; y += c, j++)
      for (let x = 0, R = RR(j); x < w; x += c) {
        const col = R() < 0.82 ? ink[0] : ink[1 % ink.length];
        o += R() < 0.5 ? `<path stroke="${col}" d="M${x} ${y}L${x + c} ${y + c}"/>` : `<path stroke="${col}" d="M${x + c} ${y}L${x} ${y + c}"/>`;
        if (R() < 0.06) d += `<circle cx="${x}" cy="${y}" r="${f(c * 0.16)}" fill="${ink[ink.length - 1]}"/>`;
      }
    return o + "</g>" + d;
  },
  trigram(w, h, c, ink, RR) {
    const L = c * 0.62,
      gap = c * 0.22,
      sw = f(c * 0.085);
    let o = `<g stroke-width="${sw}" stroke-linecap="round">`;
    for (let y = 0, j = 0; y < h; y += c, j++)
      for (let x = 0, R = RR(j); x < w; x += c) {
        const cx = x + c / 2,
          cy = y + c / 2,
          a = [0, 90, 45, -45][Math.floor(R() * 4)],
          col = ink[Math.floor(R() * ink.length)];
        let p = "";
        for (let i = -1; i <= 1; i++) p += `M${f(cx - L / 2)} ${f(cy + i * gap)}H${f(cx + L / 2)}`;
        o += `<path stroke="${col}" d="${p}" transform="rotate(${a} ${f(cx)} ${f(cy)})"/>`;
      }
    return o + "</g>";
  },
  metro(w, h, c, ink, RR, bg) {
    const sw = f(c * 0.13),
      hc = c / 2;
    let o = `<g fill="none" stroke-width="${sw}" stroke-linecap="round">`,
      st = "";
    const lines = ink.slice(0, -1).length ? ink.slice(0, -1) : ink;
    for (let y = 0, j = 0; y < h; y += c, j++)
      for (let x = 0, R = RR(j); x < w; x += c) {
        const c1 = lines[Math.floor(R() * lines.length)],
          c2 = lines[Math.floor(R() * lines.length)],
          t = R();
        if (t < 0.14) {
          o += `<path stroke="${c1}" d="M${x + hc} ${y}V${y + c}"/><path stroke="${c2}" d="M${x} ${y + hc}H${x + c}"/>`;
        } else if (t < 0.57) {
          o += `<path stroke="${c1}" d="M${x + hc} ${y}A${hc} ${hc} 0 0 1 ${x + c} ${y + hc}"/><path stroke="${c2}" d="M${x} ${y + hc}A${hc} ${hc} 0 0 1 ${x + hc} ${y + c}"/>`;
        } else {
          o += `<path stroke="${c1}" d="M${x + hc} ${y}A${hc} ${hc} 0 0 0 ${x} ${y + hc}"/><path stroke="${c2}" d="M${x + c} ${y + hc}A${hc} ${hc} 0 0 0 ${x + hc} ${y + c}"/>`;
        }
        if (R() < 0.1) st += `<circle cx="${x + hc}" cy="${y}" r="${f(c * 0.14)}" fill="${bg}" stroke="${ink[ink.length - 1]}" stroke-width="${f(c * 0.06)}"/>`;
      }
    return o + "</g>" + st;
  },
  weave(w, h, c, ink, RR) {
    let o = "";
    const n = 3,
      sw = c / (n * 2);
    for (let y = 0, j = 0; y < h; y += c, j++)
      for (let x = 0, i = 0, R = RR(j); x < w; x += c, i++) {
        const col = ink[Math.floor(R() * ink.length)];
        if (R() < 0.07) {
          o += `<rect x="${x}" y="${y}" width="${c}" height="${c}" fill="${col}"/>`;
          continue;
        }
        const horiz = (i + j) % 2 === 0;
        for (let k = 0; k < n; k++) {
          const off = f(sw / 2 + k * sw * 2);
          o += horiz
            ? `<rect x="${x}" y="${f(y + off)}" width="${c}" height="${f(sw)}" fill="${col}"/>`
            : `<rect x="${f(x + off)}" y="${y}" width="${f(sw)}" height="${c}" fill="${col}"/>`;
        }
      }
    return o;
  },
  terrain(w, h, c, ink, RR) {
    let o = `<g stroke="${ink[0]}" stroke-width="1" opacity="0.55">`;
    for (let x = 0; x <= w; x += c * 2) o += `<path d="M${x} 0V${h}"/>`;
    o += "</g>";
    for (let y = 0, j = 0; y < h; y += c, j++)
      for (let x = 0, R = RR(j); x < w; x += c) {
        if (R() > 0.5) continue;
        const cx = x + c / 2,
          cy = y + c / 2,
          s = c * (0.18 + R() * 0.3),
          col = ink[Math.floor(R() * ink.length)],
          t = Math.floor(R() * 4);
        if (t === 0) o += `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s / 2)}" fill="${col}"/>`;
        else if (t === 1) o += `<path d="M${f(cx)} ${f(cy - s / 2)}L${f(cx + s / 2)} ${f(cy + s / 2)}H${f(cx - s / 2)}Z" fill="${col}"/>`;
        else if (t === 2) o += `<path d="M${f(cx)} ${f(cy - s / 2)}L${f(cx + s / 2)} ${f(cy)}L${f(cx)} ${f(cy + s / 2)}L${f(cx - s / 2)} ${f(cy)}Z" fill="${col}"/>`;
        else o += `<rect x="${f(cx - s / 2)}" y="${f(cy - s / 2)}" width="${f(s)}" height="${f(s)}" rx="${f(s * 0.25)}" fill="${col}"/>`;
      }
    return o;
  },
  comet(w, h, c, ink, RR, _bg, clear) {
    let o = "";
    const ang = RR(-1)() * Math.PI * 2;
    for (let y = 0, j = 0; y < h; y += c, j++)
      for (let x = 0, R = RR(j); x < w; x += c) {
        const r = R();
        if (r < 0.3) {
          const hx = x + R() * c,
            hy = y + R() * c,
            a = ang + (R() - 0.5) * 1.6,
            len = c * (1.4 + R() * 2.2),
            hr = c * (0.05 + R() * 0.05);
          const tx = hx + Math.cos(a) * len,
            ty = hy + Math.sin(a) * len,
            px = -Math.sin(a) * hr,
            py = Math.cos(a) * hr;
          const col = ink[Math.floor(R() * ink.length)];
          o += `<path d="M${f(hx + px)} ${f(hy + py)}L${f(tx)} ${f(ty)}L${f(hx - px)} ${f(hy - py)}Z" fill="${col}" fill-opacity="0.3"/><path d="M${f(hx + px)} ${f(hy + py)}L${f(hx + (tx - hx) * 0.45)} ${f(hy + (ty - hy) * 0.45)}L${f(hx - px)} ${f(hy - py)}Z" fill="${col}" fill-opacity="0.7"/><circle cx="${f(hx)}" cy="${f(hy)}" r="${f(hr)}" fill="${clear ? col : "#FFFFFF"}"/>`;
        } else if (r < 0.55) {
          o += `<circle cx="${f(x + R() * c)}" cy="${f(y + R() * c)}" r="${f(Math.max(0.8, c * 0.025))}" fill="${clear ? ink[0] : "#FFFFFF"}" opacity="${clear ? 0.45 : 0.8}"/>`;
        }
      }
    return o;
  },
  tesserae(w, h, c, ink, RR) {
    let o = "";
    const s = c * 0.84;
    for (let y = 0, j = 0; y < h; y += c, j++)
      for (let x = 0, R = RR(j); x < w; x += c) {
        const cx = x + c / 2,
          cy = y + c / 2,
          a = f((R() - 0.5) * 14),
          col = ink[Math.floor(R() * ink.length)];
        o +=
          R() < 0.06
            ? `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(s / 2.2)}" fill="${col}"/>`
            : `<rect x="${f(cx - s / 2)}" y="${f(cy - s / 2)}" width="${f(s)}" height="${f(s)}" rx="${f(c * 0.06)}" fill="${col}" transform="rotate(${a} ${f(cx)} ${f(cy)})"/>`;
      }
    return o;
  },
};

function lum(hex: string) {
  const n = parseInt(String(hex).replace("#", ""), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
}

export interface PatternOptions {
  discipline: DisciplineKey;
  seed: string;
  width: number;
  height: number;
  kind?: PatternKind;
  /** Palette swatches; the first is the ground color. */
  palette?: string[];
  /** Multiplies the cell size. */
  scale?: number;
  /** Draw the palette's ground color instead of leaving white. */
  solidGround?: boolean;
  /** Variation step for the slow cycling animation. */
  step?: number;
}

/** Returns the inner markup of an SVG covering width x height. */
export function patternMarkup(o: PatternOptions): string {
  const entry = PATTERN_MAP[o.discipline] || PATTERN_MAP.other;
  const kind = o.kind || entry[0];
  const pal = o.palette && o.palette.length > 1 ? o.palette : entry[1];
  const clear = !o.solidGround;
  let bg = pal[0];
  let ink = pal.slice(1);
  if (clear) {
    if (lum(pal[0]) < 0.4) {
      const k = pal.slice(1).filter((x) => lum(x) < 0.7);
      ink = [pal[0]].concat(k);
    }
    bg = "#FFFFFF";
  }
  const c = CELL * (o.scale || 1);
  const seed = o.seed + (o.step ? "/" + o.step : "");
  const RR = (row: number) => rng(seed + kind + ":" + row);
  const ground = clear ? "" : `<rect width="${o.width}" height="${o.height}" fill="${bg}"/>`;
  return ground + GEN[kind](o.width + c, o.height + c, c, ink, RR, bg, clear);
}

export const patternKindFor = (d: DisciplineKey) => (PATTERN_MAP[d] || PATTERN_MAP.other)[0];
