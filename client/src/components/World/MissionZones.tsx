import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useMissonStore } from '../../Store/missonStore';
import { usePlayerStore } from '../../Store/PlayerStore';
import type { MissionConfig } from './WorldTypes';

const DEBUG_RING_COLOR = '#facc15'