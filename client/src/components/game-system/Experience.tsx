import { Physics, RigidBody } from "@react-three/rapier";
import Lights from './Lights';
import EcctrlWrapper from './EccrtlWrapper';
import { useEffect, useState } from "react";
import { EffectComposer, HueSaturation, Vignette } from "@react-three/postprocessing"
import { TestMap } from "../layout/TestMap";
import ForestHouseModel from "../models/ForestHouseModel";
import ToonTree from "../models/ToonTree";
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
            <fog attach="fog" args={['#bcc0fe', 0, 100]} />
            <EffectComposer multisampling={1}>
                <HueSaturation saturation={-0.25} />
                <Vignette offset={0.25} darkness={0.0} />
            </EffectComposer>
            <axesHelper />
            <Lights />
            <Physics timeStep='vary' gravity={[0, -9.81, 0]} paused={!physicsActive}>
                <RigidBody colliders="trimesh" position={[-3, 0, 5]} type="fixed" >
                    <ForestHouseModel scale={100} position={[50, 0, 10]} rotation={[0, Math.PI / 2, 0]} />
                </RigidBody>
                <RigidBody colliders="trimesh" position={[-3, 0, 5]} type="fixed" >
                    <ToonTree scale={10} position={[-40, 10, 0]} rotation={[0, Math.PI / 2, 0]} />
                </RigidBody>
                <TestMap />
                <EcctrlWrapper />
            </Physics >
        </>
    )
};