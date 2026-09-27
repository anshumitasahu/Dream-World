import { createFileRoute } from '@tanstack/react-router'
import MagicWand from '../assets/MagicWand'

export const Route = createFileRoute('/svg')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-black w-screen h-screen">
      {/* dialogue box with avatar frame */}
      <div className="flex gap-8">
        <MagicWand className="w-100" />
      </div>
    </div>
  )
}
