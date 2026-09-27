import { useEffect, useState, type ReactNode } from 'react'
import {
  AlarmIcon,
  ArrowClockwiseIcon,
  CheckCircleIcon,
  CircleIcon,
  PlayIcon,
} from '@phosphor-icons/react'
import MissionBoard from '../ui/Mission/MissionBoard'
import FantasyFrame from '../ui/Hud/FantasyFrame'
import MiniMap from '../ui/Hud/MiniMap'
import TimeBar from '../ui/Hud/TimeBar'
import { useMissionStore } from '../../store/missionStore'
import { usePlayerHudStore } from '../../store/playerHudStore'
import { usePlayerLoadoutStore } from '../../store/playerLoadoutStore'

const DEFAULT_ALARM_MINUTES = 5
const LOW_ALARM_SECONDS = 60

interface PlayerHudProps {
  alarmMinutes?: number
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className='rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans text-[10px] font-medium leading-none text-white/70'>
      {children}
    </kbd>
  )
}

function ControlHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className='flex items-center gap-1.5'>
      <span className='flex items-center gap-1'>
        {keys.map((key) => (
          <Key key={key}>{key}</Key>
        ))}
      </span>
      {label}
    </span>
  )
}

/**
 * Viewmodel crosshair, shown only while the player carries the M4: four ticks
 * around a centre dot, with the gap reading as a hip-fire spread.
 */
function Crosshair() {
  return (
    <div className='pointer-events-none absolute left-1/2 top-1/2 z-10 h-8 w-8 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]'>
      <span className='absolute left-1/2 top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/95' />
      <span className='absolute left-1/2 top-0 h-2.5 w-[2px] -translate-x-1/2 rounded-full bg-white/80' />
      <span className='absolute bottom-0 left-1/2 h-2.5 w-[2px] -translate-x-1/2 rounded-full bg-white/80' />
      <span className='absolute left-0 top-1/2 h-[2px] w-2.5 -translate-y-1/2 rounded-full bg-white/80' />
      <span className='absolute right-0 top-1/2 h-[2px] w-2.5 -translate-y-1/2 rounded-full bg-white/80' />
    </div>
  )
}

interface StartOverlayProps {
  alarmMinutes: number
  onPlay: () => void
}

/**
 * Pre-run briefing. Missions are shown here — and only here — in the fantasy
 * mission board; once the player locks in, the HUD drops to the in-game panels.
 */
function StartOverlay({ alarmMinutes, onPlay }: StartOverlayProps) {
  return (
    <div
      onClick={onPlay}
      className='absolute inset-0 z-10 flex cursor-pointer select-none flex-col items-center justify-center gap-7 overflow-y-auto bg-gradient-to-b from-black/80 via-black/60 to-black/80 px-6 py-8 text-center backdrop-blur-sm'
    >
      <div className='animate-hud-in flex flex-col items-center gap-2'>
        <span className='flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5'>
          <AlarmIcon className='h-6 w-6 text-white/80' weight='duotone' />
        </span>
        <h1 className='font-mono text-2xl font-semibold tracking-tight text-white'>Before the alarm</h1>
      </div>

      <MissionBoard />

      <div className='flex flex-col items-center gap-3'>
        <span className='animate-hud-in flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 font-mono text-[13px] font-medium text-white shadow-2xl'>
          <PlayIcon className='h-3.5 w-3.5' weight='fill' />
          Click to explore
        </span>

        <div className='flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-[11px] text-white/40'>
          <ControlHint keys={['W', 'A', 'S', 'D']} label='Move' />
          <ControlHint keys={['Space']} label='Jump' />
          <ControlHint keys={['Shift']} label='Run' />
          <ControlHint keys={['Esc']} label='Release' />
        </div>

        <p className='text-[11px] tracking-wide text-white/30'>
          You have {alarmMinutes} minutes before the alarm rings.
        </p>
      </div>
    </div>
  )
}

interface WakeUpOverlayProps {
  onRestart: () => void
}

/**
 * End-of-run screen: the alarm has rung and the player wakes up. The wake-up
 * art sits beneath a theme-tinted shade — dark red while any mission is left
 * undone, dark green once every mission is complete — with the run's mission
 * summary in a fantasy frame matching that shade.
 */
function WakeUpOverlay({ onRestart }: WakeUpOverlayProps) {
  const missions = useMissionStore((state) => state.missions)
  const completedIds = useMissionStore((state) => state.completedIds)

  const allComplete = missions.length > 0 && completedIds.length >= missions.length
  const theme = allComplete ? 'green' : 'red'
  const shade = allComplete
    ? 'from-emerald-950/95 via-emerald-900/65 to-black/95'
    : 'from-red-950/95 via-red-900/65 to-black/95'
  const tint = allComplete ? 'bg-emerald-950/25' : 'bg-red-950/35'
  const labelColor = allComplete ? 'text-emerald-200/85' : 'text-red-200/80'

  return (
    <div className='absolute inset-0 z-40 select-none overflow-hidden bg-black'>
      <img src='/img/wake-up.png' alt='' className='absolute inset-0 h-full w-full object-cover' />
      <div className={`absolute inset-0 bg-gradient-to-b ${shade}`} />
      <div className={`absolute inset-0 ${tint}`} />

      <div className='relative z-10 flex h-full flex-col items-center justify-center gap-6 overflow-y-auto px-6 py-10 text-center'>
        <div className='animate-hud-in flex flex-col items-center gap-2'>
          <span className='font-mono text-[11px] font-semibold uppercase tracking-[0.42em] text-white/45'>
            {allComplete ? 'Dream complete' : 'The alarm rang'}
          </span>
          <h1 className='font-mono text-3xl font-semibold tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]'>
            You wake up
          </h1>
        </div>

        <div className='animate-hud-in'>
          <FantasyFrame
            theme={theme}
            className='w-[34rem]'
            boxHeight={150}
            contentClassName='flex-col items-stretch px-12 pb-12 pt-16 text-left'
          >
            <div className='flex items-center justify-between'>
              <p className={`font-mono text-[11px] font-semibold uppercase tracking-[0.32em] ${labelColor}`}>
                {allComplete ? 'All missions complete' : 'Missions remaining'}
              </p>
              <span className='font-mono text-[11px] tabular-nums text-white/45'>
                {completedIds.length}/{missions.length}
              </span>
            </div>

            {missions.length === 0 ? (
              <p className='mt-4 flex-1 text-[13px] leading-snug text-white/55'>
                No missions in this world — you dreamt freely.
              </p>
            ) : (
              <ul className='mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1'>
                {missions.map((mission) => {
                  const done = completedIds.includes(mission.id)
                  return (
                    <li key={mission.id} className='flex items-start gap-2.5'>
                      {done ? (
                        <CheckCircleIcon className='mt-0.5 h-4 w-4 shrink-0 text-emerald-400' weight='fill' />
                      ) : (
                        <CircleIcon className='mt-0.5 h-4 w-4 shrink-0 text-white/30' />
                      )}
                      <div className='min-w-0'>
                        <p
                          className={`text-[13.5px] font-semibold leading-tight ${
                            done ? 'text-white/40 line-through' : 'text-white/90'
                          }`}
                        >
                          {mission.name}
                        </p>
                        {mission.description && (
                          <p className='mt-0.5 text-[11.5px] leading-snug text-white/50'>{mission.description}</p>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className='mt-3 border-t border-white/10 pt-3'>
              <p className='font-mono text-[11.5px] leading-relaxed text-white/60'>
                {allComplete
                  ? 'Every mission complete before the alarm — a dream well lived.'
                  : 'The alarm rang before you could finish everything. The dream slips away.'}
              </p>
            </div>
          </FantasyFrame>
        </div>

        <button
          type='button'
          onClick={onRestart}
          className='animate-hud-in flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 font-mono text-[13px] font-medium text-white shadow-2xl transition-colors hover:bg-white/20'
        >
          <ArrowClockwiseIcon className='h-3.5 w-3.5' weight='fill' />
          Dream again
        </button>
      </div>
    </div>
  )
}

export default function PlayerHud({ alarmMinutes = DEFAULT_ALARM_MINUTES }: PlayerHudProps = {}) {
  const isPointerLocked = usePlayerHudStore((state) => state.isPointerLocked)
  const alarmEndsAt = usePlayerHudStore((state) => state.alarmEndsAt)
  const isGameOver = usePlayerHudStore((state) => state.isGameOver)
  const armed = usePlayerLoadoutStore((state) => state.activeCharacter === 'armed')
  const startAlarm = usePlayerHudStore((state) => state.startAlarm)
  const resetAlarm = usePlayerHudStore((state) => state.resetAlarm)
  const endRun = usePlayerHudStore((state) => state.endRun)
  const restartRun = usePlayerHudStore((state) => state.restartRun)

  const [now, setNow] = useState(() => Date.now())

  // A run lives exactly as long as the pointer is locked: locking starts the
  // alarm, ESC resets it, so every session gets a fresh countdown. Frozen once
  // the run is over so the wake-up screen keeps the final mission state.
  useEffect(() => {
    if (isGameOver) return
    if (isPointerLocked) startAlarm(alarmMinutes * 60_000)
    else resetAlarm()
  }, [isPointerLocked, isGameOver, alarmMinutes, startAlarm, resetAlarm])

  useEffect(() => {
    if (!isPointerLocked || isGameOver || alarmEndsAt === null) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [isPointerLocked, isGameOver, alarmEndsAt])

  const totalMs = alarmMinutes * 60_000
  // `now` only ticks once a second, so clamp to the full duration for the first
  // second of a run (and against clock jumps) instead of overshooting 100%.
  const remainingMs =
    alarmEndsAt === null ? totalMs : Math.min(totalMs, Math.max(0, alarmEndsAt - now))
  const expired = alarmEndsAt !== null && remainingMs <= 0

  // The alarm ringing ends the run: freeze the game and drop pointer lock so the
  // wake-up screen can take over. Guarded so it only fires once.
  useEffect(() => {
    if (!expired || isGameOver) return
    endRun()
    if (document.pointerLockElement) document.exitPointerLock()
  }, [expired, isGameOver, endRun])

  const requestPointerLock = () => {
    const canvas = document.querySelector('#root canvas')
    if (!(canvas instanceof HTMLCanvasElement)) return
    const lockRequest = canvas.requestPointerLock() as unknown as Promise<void> | undefined
    if (lockRequest && typeof lockRequest.catch === 'function') lockRequest.catch(() => {})
  }

  if (isGameOver) {
    return <WakeUpOverlay onRestart={restartRun} />
  }

  if (!isPointerLocked) {
    return <StartOverlay alarmMinutes={alarmMinutes} onPlay={requestPointerLock} />
  }

  const low = remainingMs <= LOW_ALARM_SECONDS * 1000
  const drainColor = expired ? '#fb7185' : low ? '#fbbf24' : '#6226c4'

  return (
    <>
      <div className='pointer-events-none absolute left-5 top-5 z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]'>
        <TimeBar className='w-100' time={totalMs} remaining={remainingMs} drainColor={drainColor} />
      </div>
      <div className='pointer-events-none absolute right-5 top-5 z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]'>
        <MiniMap />
      </div>
      {armed && <Crosshair />}
    </>
  )
}
