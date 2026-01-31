// src/constants/tags.ts


export enum TagID {
    Pokemon = 0,
    YuGiOh = 1,
    MTG = 2,
    Old_systems = 3,
    Game_cartridges = 4,
    Merch = 5,
    Patches = 6,
    Apparel = 7,
    Misc = 8,
    Jordans = 9,
    Adidas = 10,
    Nike = 11,
    Jersies =  12,
    Signed_stuff = 13,
    Items = 14,
}


export const UI_TAG_MAP: Record<string, number> = {
  '#Pokemon': TagID.Pokemon,
  '#YuGiOh': TagID.YuGiOh,
  '#MTG': TagID.MTG,
  '#Old Systems': TagID.Old_systems,
  '#Game Cartridges': TagID.Game_cartridges,
  '#Merch': TagID.Merch,
  '#Patches': TagID.Patches,
  '#Apparel': TagID.Apparel,
  '#Misc': TagID.Misc,
  '#Jordans': TagID.Jordans,
  '#Adidas': TagID.Adidas,
    '#Nike': TagID.Nike,
    '#Jersies': TagID.Jersies,
    '#Signed Stuff': TagID.Signed_stuff,
    '#Items': TagID.Items,
};


export const ID_TO_STR: Record<number, string> = Object.fromEntries(
  Object.entries(UI_TAG_MAP).map(([name, id]) => [id, name])
);