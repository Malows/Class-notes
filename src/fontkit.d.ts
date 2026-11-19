declare module "fontkit" {
  export interface FontkitGlyph {
    id: number;
    name: string;
  }

  export interface FontkitLayoutRun {
    glyphs: FontkitGlyph[];
  }

  export interface FontkitFont {
    layout(text: string): FontkitLayoutRun;
  }

  export function create(buffer: Uint8Array): FontkitFont;
}
