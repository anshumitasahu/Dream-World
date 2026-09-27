import { useEffect, useRef, useState } from 'react'

const BAR_START_X = 18.6202
const BAR_END_X = 481.12

function formatTime(ms: number) {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export default function TimeBar({
  className = 'w-32',
  time = 0,
  drainColor = 'black',
  onComplete,
  remaining,
}: {
  className?: string
  time: number
  drainColor?: string
  onComplete?: () => void
  /** Controlled remaining time in ms. When set, TimeBar renders it instead of running its own countdown. */
  remaining?: number
}) {
  const controlled = remaining !== undefined
  const [internalRemaining, setInternalRemaining] = useState(time)
  const startedAtRef = useRef(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (controlled || time <= 0) return

    startedAtRef.current = performance.now()
    let frame = requestAnimationFrame(function tick() {
      const left = Math.max(0, time - (performance.now() - startedAtRef.current))
      setInternalRemaining(left)
      if (left > 0) {
        frame = requestAnimationFrame(tick)
      } else {
        onCompleteRef.current?.()
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [time, controlled])

  const left =
    remaining !== undefined
      ? Math.max(0, Math.min(remaining, time))
      : time > 0
        ? Math.min(internalRemaining, time)
        : 0
  const progress = time > 0 ? left / time : 0
  const drainX = (BAR_START_X + (BAR_END_X - BAR_START_X) * progress) + 4

  return (
    <div>
      <svg className={className} viewBox="0 0 366 76" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g id="time-bar">
          <g id="decor">
            <g id="Group 61">
              <g id="Group 53">
                <path id="Vector 13" d="M88.1202 23L79.6202 29.5H96.1202L88.1202 23Z" fill="url(#paint0_linear_2022_65)" />
                <path id="Vector 11" d="M88.1202 10L79.6202 29.5L88.1202 23V10Z" fill="url(#paint1_linear_2022_65)" />
                <path id="Vector 12" d="M88.1202 23V10L96.6202 29.5L88.1202 23Z" fill="url(#paint2_linear_2022_65)" />
              </g>
              <g id="Group 54">
                <path id="Vector 13_2" d="M137.12 24.3433L129.62 29.2648H144.179L137.12 24.3433Z" fill="url(#paint3_linear_2022_65)" />
                <path id="Vector 11_2" d="M137.12 14.5L129.62 29.2647L137.12 24.3431V14.5Z" fill="url(#paint4_linear_2022_65)" />
                <path id="Vector 12_2" d="M137.12 24.3431V14.5L144.62 29.2647L137.12 24.3431Z" fill="url(#paint5_linear_2022_65)" />
              </g>
              <g id="Group 55">
                <path id="Vector 13_3" d="M184.12 25.3433L177.62 29.2648H190.238L184.12 25.3433Z" fill="url(#paint6_linear_2022_65)" />
                <path id="Vector 11_3" d="M184.12 17.5L177.62 29.2647L184.12 25.3432V17.5Z" fill="url(#paint7_linear_2022_65)" />
                <path id="Vector 12_3" d="M184.12 25.3432V17.5L190.62 29.2647L184.12 25.3432Z" fill="url(#paint8_linear_2022_65)" />
              </g>
              <g id="Group 56">
                <path id="Vector 13_4" d="M234.12 25.3433L227.62 29.2648H240.238L234.12 25.3433Z" fill="url(#paint9_linear_2022_65)" />
                <path id="Vector 11_4" d="M234.12 17.5L227.62 29.2647L234.12 25.3432V17.5Z" fill="url(#paint10_linear_2022_65)" />
                <path id="Vector 12_4" d="M234.12 25.3432V17.5L240.62 29.2647L234.12 25.3432Z" fill="url(#paint11_linear_2022_65)" />
              </g>
              <g id="Group 57">
                <path id="Vector 13_5" d="M284.12 25.6765L277.62 29.2648H290.238L284.12 25.6765Z" fill="url(#paint12_linear_2022_65)" />
                <path id="Vector 11_5" d="M284.12 18.5L277.62 29.2647L284.12 25.6765V18.5Z" fill="url(#paint13_linear_2022_65)" />
                <path id="Vector 12_5" d="M284.12 25.6765V18.5L290.62 29.2647L284.12 25.6765Z" fill="url(#paint14_linear_2022_65)" />
              </g>
              <g id="Group 58">
                <path id="Vector 13_6" d="M329.62 27.6765L324.62 30.2648H334.326L329.62 27.6765Z" fill="url(#paint15_linear_2022_65)" />
                <path id="Vector 11_6" d="M329.62 22.5L324.62 30.2647L329.62 27.6765V22.5Z" fill="url(#paint16_linear_2022_65)" />
                <path id="Vector 12_6" d="M329.62 27.6765V22.5L334.62 30.2647L329.62 27.6765Z" fill="url(#paint17_linear_2022_65)" />
              </g>
            </g>
            <g id="Group 60">
              <path id="Vector 15" d="M42.0251 13.0487C34.1152 8.9078 29.7507 8.18183 22.0215 8.13583C22.0215 8.13583 30.0276 5.34775 35.5761 5.22141C40.6139 5.10671 48.443 7.07663 48.443 7.07663L57.2518 16.0556L42.0251 13.0487Z" fill="url(#paint18_linear_2022_65)" />
              <path id="Vector 14" d="M56.2869 6.75C62.0661 10.3569 67.6202 18 67.6202 18L55.6202 15.75C48.8309 8.38846 43.9811 4.96011 33.6202 0C33.6202 0 49.7875 2.69359 56.2869 6.75Z" fill="url(#paint19_linear_2022_65)" />
              <path id="Vector 16" d="M24.6202 13C33.0463 9.35806 48.1202 12.5 48.1202 12.5L30.6202 20C22.8423 19.9818 18.7516 20.8735 11.6202 23.5C11.6202 23.5 18.6299 15.5892 24.6202 13Z" fill="url(#paint20_linear_2022_65)" />
              <path id="Vector 17" d="M13.2269 26.5441C19.8837 19.6079 35.6623 15.2589 35.6623 15.2589L21.8111 29.6113C14.3119 33.1932 10.729 35.8292 4.91225 41.3192C4.91225 41.3192 8.49428 31.4753 13.2269 26.5441Z" fill="url(#paint21_linear_2022_65)" />
              <path id="Vector 18" d="M12.2475 39.209C14.8822 32.2509 24.2584 23.4793 24.2584 23.4793L18.7554 37.9062C14.6914 43.0425 12.9891 46.0869 10.5391 51.8023C10.5391 51.8023 10.3743 44.1557 12.2475 39.209Z" fill="url(#paint22_linear_2022_65)" />
              <path id="Vector 19" d="M13.3467 48.4112C13.5423 41.7766 19.6836 32.3137 19.6836 32.3137L19.239 46.0772C17.0315 51.3593 16.411 54.3619 15.972 59.8635C15.972 59.8635 13.2076 53.1279 13.3467 48.4112Z" fill="url(#paint23_linear_2022_65)" />
            </g>
          </g>
          <g id="bar">
            <g id="Vector 9">
              <g filter="url(#filter0_i_2022_65)">
                <path d="M289.62 56.5H76.6199C76.6199 56.5 66.5511 74 50.1201 74C33.689 74 19.9148 61.4118 19.1201 45C18.2848 27.7475 30.6201 13.5 50.1201 13.5C69.6201 13.5 76.6199 30.5 76.6199 30.5H365.12L289.62 56.5Z" fill="url(#paint24_linear_2022_65)" />
              </g>
              <path d="M289.62 56.5H76.6199C76.6199 56.5 66.5511 74 50.1201 74C33.689 74 19.9148 61.4118 19.1201 45C18.2848 27.7475 30.6201 13.5 50.1201 13.5C69.6201 13.5 76.6199 30.5 76.6199 30.5H365.12L289.62 56.5Z" stroke="url(#paint25_linear_2022_65)" stroke-width="3" />
            </g>
          </g>
          <text
            id="timer-label"
            className="fill-white font-mono font-semibold tabular-nums"
            x="50.12"
            y="43.75"
            fontSize="13"
            textAnchor="middle"
            dominantBaseline="central"
          >
            {formatTime(left)}
          </text>
        </g>
        <defs>
          <filter id="filter0_i_2022_65" x="17.5802" y="12" width="348.028" height="63.5" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
            <feOffset />
            <feGaussianBlur stdDeviation="5" />
            <feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" />
            <feBlend mode="normal" in2="shape" result="effect1_innerShadow_2022_65" />
          </filter>
          <linearGradient id="paint0_linear_2022_65" x1="87.8702" y1="23" x2="87.8702" y2="29.5" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1D4C" />
            <stop offset="1" stop-color="#080019" />
          </linearGradient>
          <linearGradient id="paint1_linear_2022_65" x1="82.6202" y1="19" x2="88.6202" y2="21.5" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" stop-color="#6226C4" />
          </linearGradient>
          <linearGradient id="paint2_linear_2022_65" x1="88.6202" y1="23" x2="95.1202" y2="20.5" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1546" />
            <stop offset="1" stop-color="#030006" />
          </linearGradient>
          <linearGradient id="paint3_linear_2022_65" x1="136.9" y1="24.3433" x2="136.9" y2="29.2648" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1D4C" />
            <stop offset="1" stop-color="#080019" />
          </linearGradient>
          <linearGradient id="paint4_linear_2022_65" x1="132.267" y1="21.3145" x2="137.295" y2="23.7558" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" stop-color="#6226C4" />
          </linearGradient>
          <linearGradient id="paint5_linear_2022_65" x1="137.561" y1="24.3431" x2="143.044" y2="21.8859" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1546" />
            <stop offset="1" stop-color="#030006" />
          </linearGradient>
          <linearGradient id="paint6_linear_2022_65" x1="183.929" y1="25.3433" x2="183.929" y2="29.2648" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1D4C" />
            <stop offset="1" stop-color="#080019" />
          </linearGradient>
          <linearGradient id="paint7_linear_2022_65" x1="179.914" y1="22.9299" x2="184.125" y2="25.1535" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" stop-color="#6226C4" />
          </linearGradient>
          <linearGradient id="paint8_linear_2022_65" x1="184.502" y1="25.3432" x2="189.113" y2="23.0957" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1546" />
            <stop offset="1" stop-color="#030006" />
          </linearGradient>
          <linearGradient id="paint9_linear_2022_65" x1="233.929" y1="25.3433" x2="233.929" y2="29.2648" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1D4C" />
            <stop offset="1" stop-color="#080019" />
          </linearGradient>
          <linearGradient id="paint10_linear_2022_65" x1="229.914" y1="22.9299" x2="234.125" y2="25.1535" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" stop-color="#6226C4" />
          </linearGradient>
          <linearGradient id="paint11_linear_2022_65" x1="234.502" y1="25.3432" x2="239.113" y2="23.0957" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1546" />
            <stop offset="1" stop-color="#030006" />
          </linearGradient>
          <linearGradient id="paint12_linear_2022_65" x1="283.929" y1="25.6765" x2="283.929" y2="29.2648" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1D4C" />
            <stop offset="1" stop-color="#080019" />
          </linearGradient>
          <linearGradient id="paint13_linear_2022_65" x1="279.914" y1="23.4683" x2="283.953" y2="25.7997" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" stop-color="#6226C4" />
          </linearGradient>
          <linearGradient id="paint14_linear_2022_65" x1="284.502" y1="25.6765" x2="288.947" y2="23.3086" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1546" />
            <stop offset="1" stop-color="#030006" />
          </linearGradient>
          <linearGradient id="paint15_linear_2022_65" x1="329.473" y1="27.6765" x2="329.473" y2="30.2648" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1D4C" />
            <stop offset="1" stop-color="#080019" />
          </linearGradient>
          <linearGradient id="paint16_linear_2022_65" x1="326.385" y1="26.0837" x2="329.389" y2="27.9328" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" stop-color="#6226C4" />
          </linearGradient>
          <linearGradient id="paint17_linear_2022_65" x1="329.914" y1="27.6765" x2="333.232" y2="25.7913" gradientUnits="userSpaceOnUse">
            <stop stop-color="#2B1546" />
            <stop offset="1" stop-color="#030006" />
          </linearGradient>
          <linearGradient id="paint18_linear_2022_65" x1="39.0976" y1="5.32345" x2="39.7376" y2="12.5138" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint19_linear_2022_65" x1="54.9536" y1="5.85" x2="53.6187" y2="10.2995" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint20_linear_2022_65" x1="12.6202" y1="23" x2="36.6202" y2="16.5" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint21_linear_2022_65" x1="5.67513" y1="40.4394" x2="24.8872" y2="22.5208" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint22_linear_2022_65" x1="10.8191" y1="50.9507" x2="17.0712" y2="31.5976" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint23_linear_2022_65" x1="15.9546" y1="59.0593" x2="17.6914" y2="41.0169" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint24_linear_2022_65" x1={drainX} y1="44" x2={BAR_START_X} y2="44" gradientUnits="userSpaceOnUse">
            <stop stop-color={drainColor} stop-opacity="0.1" />
            <stop offset="1" stop-color={drainColor} />
          </linearGradient>
          <linearGradient id="paint25_linear_2022_65" x1="19.0802" y1="43.75" x2="365.12" y2="43.75" gradientUnits="userSpaceOnUse">
            <stop stop-color="#211047" />
            <stop offset="0.406428" stop-color="#5C27B1" />
            <stop offset="1" stop-color="#090418" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}