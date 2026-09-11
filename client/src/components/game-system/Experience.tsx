import { Physics } from "@react-three/rapier";
import Lights from './Lights';
import EcctrlWrapper from './EccrtlWrapper';
import { useEffect, useState } from "react";
import { EffectComposer, HueSaturation, Vignette } from "@react-three/postprocessing";
import { World } from "../layout/World";
import testWorld from '../layout/testWorld.json';
// import ForestHouseModel from "../models/ForestHouseModel";
// import { OrbitControls } from "@react-three/drei";
// import { TestMap } from "../layout/TestMap";
// import ToonTree from "../models/ToonTree";
// import ToonTree from "../models/ToonTree";


export default function Experience() {
    const [physicsActive, setPhysicsActive] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setPhysicsActive(true), 1000);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <>
            <color attach="background" args={['#bccofe']} />
            <fog attach="fog" args={['#dbddff', 0, 100]} />
            <EffectComposer multisampling={1}>
                <HueSaturation saturation={-0.35} />
                <Vignette offset={0.25} darkness={0.75} />
            </EffectComposer>
            <Lights />
            <Physics timeStep='vary' gravity={[0, -9.81, 0]} paused={!physicsActive} >
                {/* <ForestHouseModel position={[3, 0, 0]} scale={10} /> */}
                {/* <OrbitControls/> */}
                <World config={testWorld} />
                <EcctrlWrapper />
            </Physics>
        </>
    )
};