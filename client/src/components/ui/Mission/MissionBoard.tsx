import { AlarmIcon, CheckCircleIcon, CircleIcon } from '@phosphor-icons/react'
import { useMissionStore } from '../../../store/missionStore'
import FantasyFrame from '../Hud/FantasyFrame'

/** Matches the frame's rendered width; the top padding clears the dragon ornament. */
const FRAME_WIDTH = 'w-[38rem]'
const FRAME_BOX_HEIGHT = 170

/**
 * Pre-explore mission briefing: every mission for the active world plus the
 * alarm reminder, dressed in the same fantasy frame as `SuccessDialogue`.
 */
export default function MissionBoard({ className = '' }: { className?: string }) {
  const missions = useMissionStore((state) => state.missions)
  const completedIds = useMissionStore((state) => state.completedIds)

  return (
    <div className={`animate-hud-in ${className}`}>
      <FantasyFrame
        className={FRAME_WIDTH}
        boxHeight={FRAME_BOX_HEIGHT}
        contentClassName='flex-col items-stretch px-12 pb-14 pt-16 text-left'
      >
        <div className='flex items-center justify-between'>
          <p className='font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-amber-200/80'>
            Missions
          </p>
          <span className='font-mono text-[11px] tabular-nums text-white/45'>
            {completedIds.length}/{missions.length}
          </span>
        </div>

        {missions.length === 0 ? (
          <p className='mt-4 flex-1 text-[13px] leading-snug text-white/55'>
            No missions in this world — explore the map freely.
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

        <div className='mt-3 flex items-start gap-2.5 border-t border-amber-200/15 pt-3'>
          <AlarmIcon className='mt-0.5 h-4 w-4 shrink-0 text-amber-300/80' weight='duotone' />
          <p className='font-mono text-[11.5px] leading-relaxed text-amber-100/85'>
            Complete the missions and explore the map before the alarm goes off and you wake up.
          </p>
        </div>
      </FantasyFrame>
    </div>
  )
}
