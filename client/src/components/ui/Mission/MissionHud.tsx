import { useEffect, useState } from 'react'
import { CheckCircleIcon } from '@phosphor-icons/react'
import { useMissionStore } from '../../../store/missionStore'
import FantasyFrame from '../Hud/FantasyFrame'

const TOAST_DURATION_MS = 4000

/**
 * In-game feedback only: the full mission list is shown before exploring (see
 * `MissionBoard` in the start overlay), so during a run this just flashes a
 * "mission complete" toast.
 */
export default function MissionHud() {
  const missions = useMissionStore((state) => state.missions)
  const completedIds = useMissionStore((state) => state.completedIds)
  const version = useMissionStore((state) => state.version)

  const [dismissedVersion, setDismissedVersion] = useState(0)

  const lastCompletedId = completedIds[completedIds.length - 1]
  const lastCompleted = lastCompletedId
    ? missions.find((mission) => mission.id === lastCompletedId) ?? null
    : null
  const toast = version > dismissedVersion ? lastCompleted : null

  useEffect(() => {
    if (version === dismissedVersion) return
    const timer = setTimeout(() => setDismissedVersion(version), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [version, dismissedVersion])

  if (!toast) return null

  return (
    <div className='pointer-events-none absolute inset-x-0 top-16 z-30 flex justify-center px-4'>
      <div key={version} className='animate-mission-in'>
        <FantasyFrame
          className='w-125'
          contentClassName='flex-col items-center justify-center gap-0.5 px-6 pt-6 text-center'
        >
          <p className='flex items-center gap-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.32em] text-amber-200/80'>
            <CheckCircleIcon className='h-3.5 w-3.5 text-emerald-400' weight='fill' />
            Mission complete
          </p>
          <p className='text-[15px] font-semibold text-white'>{toast.name}</p>
        </FantasyFrame>
      </div>
    </div>
  )
}
