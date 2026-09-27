import { createFileRoute } from '@tanstack/react-router'
import AvatarFrame from '../components/ui/Hud/AvatarFrame'
import DialogueBox from '../components/ui/Hud/DialogueBox'
import TimeBar from '../components/ui/Hud/TimeBar'
import SuccessDialogue from '../components/ui/Hud/SuccessDialogue'
import SpecialCircularFrame from '../components/ui/Hud/SpecialCircularFrame'

export const Route = createFileRoute('/svg')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-white w-screen h-screen">
      {/* dialogue box with avatar frame */}
      <div className="flex gap-8">
        <AvatarFrame className="h-48" imgSrc="/img/avatar/skeleton-dragon.webp" />
        <DialogueBox className="w-125">
          Hello, I am a skeleton dragon! fsfsdfsdf slkdf lksdf ksdljfslkdf lsd flksdjf lsdfj lskdjf lskdfj
        </DialogueBox>
      </div>

      <TimeBar className="w-125" time={5000} drainColor='#5000e6' onComplete={() => alert("done")} />

      <SuccessDialogue className="w-125" text="Congratulations! You have completed the task successfully." />
      <SpecialCircularFrame className="w-60" />
    </div>
  )
}
