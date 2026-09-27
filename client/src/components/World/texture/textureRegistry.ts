const BASE_URL = import.meta.env.VITE_CDN_URL || 'https://r2.geckostack.store'
const TEXTURE_PATH = `${BASE_URL}/texture`

export const textureRegistry = {
  default: {
    url: `${TEXTURE_PATH}/ground/soil`,
  },
  grass: {
    url: `${TEXTURE_PATH}/ground/grass`,
  },
  soil: {
    url: `${TEXTURE_PATH}/ground/soil`,
  },
  snow: {
    url: `${TEXTURE_PATH}/ground/snow`,
  },
  sand: {
    url: `${TEXTURE_PATH}/ground/sand`,
  },
  mud: {
    url: `${TEXTURE_PATH}/ground/mud`,
  }
}

export type TextureKind = keyof typeof textureRegistry