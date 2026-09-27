import { useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { KTX2Loader, type GLTFLoader } from 'three-stdlib'
import type { WebGLRenderer } from 'three'

/** Self-hosted basis transcoder (public/basis, copied from the installed three version) */
const TRANSCODER_PATH = '/basis/'

let sharedKtx2Loader: KTX2Loader | null = null
let configuredRenderer: WebGLRenderer | null = null

export function extendGltfLoaderWithKtx2(renderer: WebGLRenderer) {
  return (loader: GLTFLoader) => {
    if (!sharedKtx2Loader) sharedKtx2Loader = new KTX2Loader()
    if (configuredRenderer !== renderer) {
      sharedKtx2Loader.setTranscoderPath(TRANSCODER_PATH)
      sharedKtx2Loader.detectSupport(renderer)
      configuredRenderer = renderer
    }
    loader.setKTX2Loader(sharedKtx2Loader)
  }
}

/** Memoized extendLoader callback for useGLTF: `useGLTF(url, true, true, extendWithKtx2)` */
export function useKtx2LoaderExtender() {
  const gl = useThree((s) => s.gl)
  return useMemo(() => extendGltfLoaderWithKtx2(gl), [gl])
}
