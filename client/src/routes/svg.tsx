import { createFileRoute } from '@tanstack/react-router'
import AvatarFrame from '../components/ui/Hud/AvatarFrame'
import DialogueBox from '../components/ui/Hud/DialogueBox'
import TimeBar from '../components/ui/Hud/TimeBar'
import SuccessDialogue from '../components/ui/Hud/SuccessDialogue'
import SpecialCircularFrame from '../components/ui/Hud/SpecialCircularFrame'
import MagicWand from '../assets/MagicWand'

export const Route = createFileRoute('/svg')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-white w-screen h-screen">
      {/* dialogue box with avatar frame */}
      <div className="flex gap-8">
        <MagicWand className="w-16 h-16" />
      </div>
    </div>
  )
}
