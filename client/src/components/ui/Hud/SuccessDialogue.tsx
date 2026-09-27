import FantasyFrame from './FantasyFrame'

export default function SuccessDialogue({
  className = 'w-125',
  text,
}: {
  className?: string
  text: string
}) {
  return <FantasyFrame className={className}>{text}</FantasyFrame>
}
