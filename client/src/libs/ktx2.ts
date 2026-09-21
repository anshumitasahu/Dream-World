import { useMemo } from 'react';
import { useThree } from '@react-three/fiber';
import { KTX2Loader, type GLTFLoader } from 'three/examples/jsm/Addons.js';
import type { WebGLRenderer } from 'three';

const TRANSCODER_PATH = '/basis/';

let sharedKtx2Loader: KTX2Loader | null = null
let configureRenderer: WebGLRenderer | null = null

export function extendGltfLoaderWithKtx2(renderer: WebGLRenderer) {
    return (loader: GLTFLoader) => {
        if (!sharedKtx2Loader) sharedKtx2Loader = new KTX2Loader()
        if (configureRenderer !== renderer) {
            sharedKtx2Loader.setTranscoderPath(TRANSCODER_PATH)
            sharedKtx2Loader.detectSupport(renderer)
            configureRenderer = renderer
        }
        loader.setKTX2Loader(sharedKtx2Loader)
    }
}

export function useKtx2LoaderExtender() {
    const gl = useThree((s) => s.gl)
    return useMemo(() => extendGltfLoaderWithKtx2(gl), [gl])
}