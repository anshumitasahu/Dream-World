export default function Lights() {
    return (
        <>
            <directionalLight castShadow position={[0, 150, 0]} shadow-mapSize={[1024, 1024]} intensity={0.5} >
                <orthographicCamera attach='shadow-camera' args={[-100, 100, 200, -200, 1, 160]} />
            </directionalLight>
            <hemisphereLight intensity={0.5} groundColor="#d9e7ff" color="#fff" />
        </>
    );
}