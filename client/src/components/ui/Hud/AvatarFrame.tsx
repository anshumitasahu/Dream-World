import { useId } from 'react'

export default function AvatarFrame({
  className = 'w-32',
  imgSrc,
}: {
  className?: string
  imgSrc: string
}) {
  const clipId = `avatar-clip-${useId().replace(/[^a-zA-Z0-9]/g, '')}`

  return (
    <div>
      <svg className={className} viewBox="0 0 94 111" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={clipId}>
            <rect x="12.5" y="22.5002" width="67" height="67" />
          </clipPath>
        </defs>
        <image
          href={imgSrc}
          x="12.5"
          y="22.5002"
          width="67"
          height="67"
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
        <rect x="12.5" y="22.5002" width="67" height="67" fill="none" stroke="url(#paint0_linear_2022_136)" stroke-width="3" />
        <path d="M24.8016 90.0937C20.1335 91.8711 17.5578 92.1826 12.9962 92.2024C12.9962 92.2024 17.7211 93.3991 20.9957 93.4533C23.9688 93.5025 28.5893 92.657 28.5893 92.657L33.7879 88.8031L24.8016 90.0937Z" fill="url(#paint1_linear_2022_136)" />
        <path d="M33.2185 92.7972C36.6291 91.249 39.907 87.9686 39.907 87.9686L32.825 88.9343C28.8182 92.0939 25.9561 93.5654 19.8414 95.6943C19.8414 95.6943 29.3828 94.5382 33.2185 92.7972Z" fill="url(#paint2_linear_2022_136)" />
        <path d="M14.5299 90.1145C19.5026 91.6777 28.3988 90.3291 28.3988 90.3291L18.0709 87.1101C13.4806 87.1179 11.0665 86.7351 6.85779 85.6078C6.85779 85.6078 10.9946 89.0032 14.5299 90.1145Z" fill="url(#paint3_linear_2022_136)" />
        <path d="M7.80602 84.3013C11.7346 87.2784 21.0466 89.145 21.0466 89.145L12.8721 82.9848C8.44637 81.4475 6.33184 80.3161 2.89903 77.9597C2.89903 77.9597 5.01302 82.1848 7.80602 84.3013Z" fill="url(#paint4_linear_2022_136)" />
        <path d="M7.22801 78.8655C8.78295 81.852 14.3164 85.6169 14.3164 85.6169L11.0687 79.4247C8.67031 77.2202 7.6657 75.9135 6.21978 73.4603C6.21978 73.4603 6.12255 76.7423 7.22801 78.8655Z" fill="url(#paint5_linear_2022_136)" />
        <path d="M7.87677 74.9159C7.9922 77.7635 11.6166 81.8251 11.6166 81.8251L11.3542 75.9176C10.0514 73.6505 9.68521 72.3618 9.42617 70.0004C9.42617 70.0004 7.7947 72.8914 7.87677 74.9159Z" fill="url(#paint6_linear_2022_136)" />
        <path d="M27.9857 95.3844C25.1338 98.3695 23.3243 99.5369 19.9321 101.223C19.9321 101.223 23.875 100.349 26.3342 99.1879C28.567 98.1336 31.712 95.834 31.712 95.834L34.2269 91.1657L27.9857 95.3844Z" fill="url(#paint7_linear_2022_136)" />
        <path d="M35.2108 94.238C37.2065 91.8781 38.4923 88.3248 38.4923 88.3248L33.5555 91.6127C31.6839 95.3465 30.0699 97.4504 26.2642 101.218C26.2642 101.218 32.9665 96.892 35.2108 94.238Z" fill="url(#paint8_linear_2022_136)" />
        <path d="M20.3385 99.1637C24.5953 98.4619 30.7489 94.2347 30.7489 94.2347L21.9177 95.7119C18.5 97.3997 16.566 98.0101 13.0323 98.7443C13.0323 98.7443 17.3122 99.6626 20.3385 99.1637Z" fill="url(#paint9_linear_2022_136)" />
        <path d="M13.2783 97.4602C17.2556 98.1549 24.8529 96.0804 24.8529 96.0804L16.5893 94.6597C12.7492 95.1795 10.7746 95.1433 7.38562 94.7119C7.38562 94.7119 10.4508 96.9664 13.2783 97.4602Z" fill="url(#paint10_linear_2022_136)" />
        <path d="M10.9308 93.7746C13.1425 95.3459 18.5935 96.0172 18.5935 96.0172L13.9899 92.7679C11.4253 92.0663 10.216 91.4977 8.27349 90.2688C8.27349 90.2688 9.35833 92.6575 10.9308 93.7746Z" fill="url(#paint11_linear_2022_136)" />
        <path d="M10.0214 90.705C11.1115 92.7043 15.2445 94.288 15.2445 94.288L12.9659 90.1487C11.1957 89.0008 10.4684 88.211 9.4427 86.6129C9.4427 86.6129 9.24638 89.2836 10.0214 90.705Z" fill="url(#paint12_linear_2022_136)" />
        <path d="M63.89 96.2235C66.5354 99.393 68.2627 100.679 71.5343 102.588C71.5343 102.588 67.6588 101.453 65.2829 100.129C63.1257 98.9276 60.1419 96.4225 60.1419 96.4225L57.9454 91.5961L63.89 96.2235Z" fill="url(#paint13_linear_2022_136)" />
        <path d="M56.7578 94.5959C54.9248 92.1075 53.8799 88.4761 53.8799 88.4761L58.5853 92.0874C60.2025 95.9382 61.6719 98.1456 65.2167 102.159C65.2167 102.159 58.8193 97.3943 56.7578 94.5959Z" fill="url(#paint14_linear_2022_136)" />
        <path d="M71.2666 100.507C67.0664 99.5218 61.2098 94.8917 61.2098 94.8917L69.9222 96.9573C73.2192 98.8704 75.1079 99.609 78.5845 100.578C78.5845 100.578 74.2526 101.208 71.2666 100.507Z" fill="url(#paint15_linear_2022_136)" />
        <path d="M78.4251 99.2804C74.4102 99.707 66.969 97.1281 66.969 97.1281L75.3093 96.2643C79.1059 97.0402 81.0785 97.1364 84.4887 96.9331C84.4887 96.9331 81.2794 98.9771 78.4251 99.2804Z" fill="url(#paint16_linear_2022_136)" />
        <path d="M81.0144 95.7604C78.7023 97.18 73.2186 97.4845 73.2186 97.4845L78.0295 94.551C80.6354 94.0229 81.8801 93.5365 83.9006 92.4405C83.9006 92.4405 82.6581 94.7512 81.0144 95.7604Z" fill="url(#paint17_linear_2022_136)" />
        <path d="M82.1272 92.7585C80.9055 94.6803 76.6757 95.9835 76.6757 95.9835L79.2265 92.0062C81.0697 90.9794 81.8483 90.2402 82.9788 88.7144C82.9788 88.7144 82.9957 91.3922 82.1272 92.7585Z" fill="url(#paint18_linear_2022_136)" />
        <path d="M68.3146 90.0937C72.9827 91.8711 75.5585 92.1826 80.12 92.2024C80.12 92.2024 75.3951 93.3991 72.1205 93.4533C69.1474 93.5025 64.5269 92.657 64.5269 92.657L59.3283 88.8031L68.3146 90.0937Z" fill="url(#paint19_linear_2022_136)" />
        <path d="M59.8977 92.7972C56.4871 91.249 53.2092 87.9686 53.2092 87.9686L60.2912 88.9343C64.298 92.0939 67.1602 93.5654 73.2748 95.6943C73.2748 95.6943 63.7334 94.5382 59.8977 92.7972Z" fill="url(#paint20_linear_2022_136)" />
        <path d="M78.5863 90.1145C73.6136 91.6777 64.7174 90.3291 64.7174 90.3291L75.0453 87.1101C79.6356 87.1179 82.0497 86.7351 86.2584 85.6078C86.2584 85.6078 82.1216 89.0032 78.5863 90.1145Z" fill="url(#paint21_linear_2022_136)" />
        <path d="M85.3102 84.3013C81.3816 87.2784 72.0696 89.145 72.0696 89.145L80.2441 82.9848C84.6698 81.4475 86.7844 80.3161 90.2172 77.9597C90.2172 77.9597 88.1032 82.1848 85.3102 84.3013Z" fill="url(#paint22_linear_2022_136)" />
        <path d="M85.8882 78.8655C84.3333 81.852 78.7998 85.6169 78.7998 85.6169L82.0475 79.4247C84.4459 77.2202 85.4505 75.9135 86.8964 73.4603C86.8964 73.4603 86.9937 76.7423 85.8882 78.8655Z" fill="url(#paint23_linear_2022_136)" />
        <path d="M85.2396 74.9159C85.1241 77.7635 81.4997 81.8251 81.4997 81.8251L81.7621 75.9176C83.0649 73.6505 83.4311 72.3618 83.6902 70.0004C83.6902 70.0004 85.3216 72.8914 85.2396 74.9159Z" fill="url(#paint24_linear_2022_136)" />
        <path d="M24.8016 20.3118C20.1335 18.5345 17.5578 18.2229 12.9962 18.2031C12.9962 18.2031 17.7211 17.0065 20.9957 16.9522C23.9688 16.903 28.5893 17.7485 28.5893 17.7485L33.7879 21.6024L24.8016 20.3118Z" fill="url(#paint25_linear_2022_136)" />
        <path d="M33.2185 17.6083C36.6291 19.1565 39.907 22.437 39.907 22.437L32.825 21.4712C28.8182 18.3116 25.9561 16.8401 19.8414 14.7112C19.8414 14.7112 29.3828 15.8673 33.2185 17.6083Z" fill="url(#paint26_linear_2022_136)" />
        <path d="M14.5299 20.291C19.5026 18.7278 28.3988 20.0764 28.3988 20.0764L18.0709 23.2955C13.4806 23.2877 11.0665 23.6704 6.85779 24.7977C6.85779 24.7977 10.9946 21.4023 14.5299 20.291Z" fill="url(#paint27_linear_2022_136)" />
        <path d="M7.80602 26.1042C11.7346 23.1271 21.0466 21.2605 21.0466 21.2605L12.8721 27.4207C8.44637 28.9581 6.33184 30.0894 2.89903 32.4458C2.89903 32.4458 5.01302 28.2207 7.80602 26.1042Z" fill="url(#paint28_linear_2022_136)" />
        <path d="M7.22801 31.54C8.78295 28.5535 14.3164 24.7887 14.3164 24.7887L11.0687 30.9808C8.67031 33.1854 7.6657 34.4921 6.21978 36.9452C6.21978 36.9452 6.12255 33.6632 7.22801 31.54Z" fill="url(#paint29_linear_2022_136)" />
        <path d="M7.87677 35.4896C7.9922 32.642 11.6166 28.5805 11.6166 28.5805L11.3542 34.4879C10.0514 36.755 9.68521 38.0438 9.42617 40.4051C9.42617 40.4051 7.7947 37.5141 7.87677 35.4896Z" fill="url(#paint30_linear_2022_136)" />
        <path d="M27.9857 15.0211C25.1338 12.036 23.3243 10.8686 19.9321 9.18272C19.9321 9.18272 23.875 10.0564 26.3342 11.2176C28.567 12.272 31.712 14.5715 31.712 14.5715L34.2269 19.2399L27.9857 15.0211Z" fill="url(#paint31_linear_2022_136)" />
        <path d="M35.2108 16.1675C37.2065 18.5274 38.4923 22.0807 38.4923 22.0807L33.5555 18.7928C31.6839 15.059 30.0699 12.9551 26.2642 9.18774C26.2642 9.18774 32.9665 13.5135 35.2108 16.1675Z" fill="url(#paint32_linear_2022_136)" />
        <path d="M20.3385 11.2418C24.5953 11.9436 30.7489 16.1708 30.7489 16.1708L21.9177 14.6937C18.5 13.0058 16.566 12.3954 13.0323 11.6612C13.0323 11.6612 17.3122 10.7429 20.3385 11.2418Z" fill="url(#paint33_linear_2022_136)" />
        <path d="M13.2783 12.9453C17.2556 12.2506 24.8529 14.3251 24.8529 14.3251L16.5893 15.7458C12.7492 15.2261 10.7746 15.2623 7.38562 15.6936C7.38562 15.6936 10.4508 13.4391 13.2783 12.9453Z" fill="url(#paint34_linear_2022_136)" />
        <path d="M10.9308 16.6309C13.1425 15.0596 18.5935 14.3883 18.5935 14.3883L13.9899 17.6376C11.4253 18.3392 10.216 18.9078 8.27349 20.1367C8.27349 20.1367 9.35833 17.748 10.9308 16.6309Z" fill="url(#paint35_linear_2022_136)" />
        <path d="M10.0214 19.7005C11.1115 17.7012 15.2445 16.1176 15.2445 16.1176L12.9659 20.2568C11.1957 21.4048 10.4684 22.1945 9.4427 23.7926C9.4427 23.7926 9.24638 21.1219 10.0214 19.7005Z" fill="url(#paint36_linear_2022_136)" />
        <path d="M63.89 14.182C66.5354 11.0125 68.2627 9.72649 71.5343 7.81705C71.5343 7.81705 67.6588 8.95297 65.2829 10.2764C63.1257 11.4779 60.1419 13.9831 60.1419 13.9831L57.9454 18.8094L63.89 14.182Z" fill="url(#paint37_linear_2022_136)" />
        <path d="M56.7578 15.8096C54.9248 18.298 53.8799 21.9294 53.8799 21.9294L58.5853 18.3182C60.2025 14.4673 61.6719 12.26 65.2167 8.24609C65.2167 8.24609 58.8193 13.0112 56.7578 15.8096Z" fill="url(#paint38_linear_2022_136)" />
        <path d="M71.2666 9.89836C67.0664 10.8838 61.2098 15.5138 61.2098 15.5138L69.9222 13.4482C73.2192 11.5351 75.1079 10.7965 78.5845 9.82721C78.5845 9.82721 74.2526 9.1978 71.2666 9.89836Z" fill="url(#paint39_linear_2022_136)" />
        <path d="M78.4251 11.1251C74.4102 10.6986 66.969 13.2774 66.969 13.2774L75.3093 14.1413C79.1059 13.3653 81.0785 13.2692 84.4887 13.4724C84.4887 13.4724 81.2794 11.4284 78.4251 11.1251Z" fill="url(#paint40_linear_2022_136)" />
        <path d="M81.0144 14.6451C78.7023 13.2255 73.2186 12.921 73.2186 12.921L78.0295 15.8545C80.6354 16.3827 81.8801 16.869 83.9006 17.965C83.9006 17.965 82.6581 15.6543 81.0144 14.6451Z" fill="url(#paint41_linear_2022_136)" />
        <path d="M82.1272 17.647C80.9055 15.7252 76.6757 14.422 76.6757 14.422L79.2265 18.3993C81.0697 19.4261 81.8483 20.1653 82.9788 21.6911C82.9788 21.6911 82.9957 19.0133 82.1272 17.647Z" fill="url(#paint42_linear_2022_136)" />
        <path d="M68.3146 20.3118C72.9827 18.5345 75.5585 18.2229 80.12 18.2031C80.12 18.2031 75.3951 17.0065 72.1205 16.9522C69.1474 16.903 64.5269 17.7485 64.5269 17.7485L59.3283 21.6024L68.3146 20.3118Z" fill="url(#paint43_linear_2022_136)" />
        <path d="M59.8977 17.6083C56.4871 19.1565 53.2092 22.437 53.2092 22.437L60.2912 21.4712C64.298 18.3116 67.1602 16.8401 73.2748 14.7112C73.2748 14.7112 63.7334 15.8673 59.8977 17.6083Z" fill="url(#paint44_linear_2022_136)" />
        <path d="M78.5863 20.291C73.6136 18.7278 64.7174 20.0764 64.7174 20.0764L75.0453 23.2955C79.6356 23.2877 82.0497 23.6704 86.2584 24.7977C86.2584 24.7977 82.1216 21.4023 78.5863 20.291Z" fill="url(#paint45_linear_2022_136)" />
        <path d="M85.3102 26.1042C81.3816 23.1271 72.0696 21.2605 72.0696 21.2605L80.2441 27.4207C84.6698 28.9581 86.7844 30.0894 90.2172 32.4458C90.2172 32.4458 88.1032 28.2207 85.3102 26.1042Z" fill="url(#paint46_linear_2022_136)" />
        <path d="M85.8882 31.54C84.3333 28.5535 78.7998 24.7887 78.7998 24.7887L82.0475 30.9808C84.4459 33.1854 85.4505 34.4921 86.8964 36.9452C86.8964 36.9452 86.9937 33.6632 85.8882 31.54Z" fill="url(#paint47_linear_2022_136)" />
        <path d="M85.2396 35.4896C85.1241 32.642 81.4997 28.5805 81.4997 28.5805L81.7621 34.4879C83.0649 36.755 83.4311 38.0438 83.6902 40.4051C83.6902 40.4051 85.3216 37.5141 85.2396 35.4896Z" fill="url(#paint48_linear_2022_136)" />
        <defs>
          <linearGradient id="paint0_linear_2022_136" x1="46" y1="21.0002" x2="46" y2="91.0002" gradientUnits="userSpaceOnUse">
            <stop stop-color="#160B25" />
            <stop offset="0.451923" stop-color="#43216D" />
            <stop offset="1" stop-color="#0B0514" />
          </linearGradient>
          <linearGradient id="paint1_linear_2022_136" x1="23.0739" y1="93.4095" x2="23.2744" y2="90.3119" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint2_linear_2022_136" x1="32.4316" y1="93.1835" x2="31.998" y2="91.1964" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint3_linear_2022_136" x1="7.44795" y1="85.8224" x2="20.7993" y2="90.7944" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint4_linear_2022_136" x1="3.34926" y1="78.3373" x2="11.366" y2="88.6182" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint5_linear_2022_136" x1="6.38501" y1="73.8258" x2="8.42756" y2="82.5194" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint6_linear_2022_136" x1="9.41589" y1="70.3456" x2="9.96039" y2="78.1232" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint7_linear_2022_136" x1="27.8674" y1="98.3948" x2="26.9132" y2="96.1052" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint8_linear_2022_136" x1="34.7607" y1="94.8034" x2="33.7575" y2="93.5215" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint9_linear_2022_136" x1="13.5477" y1="98.6819" x2="25.2761" y2="97.6496" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint10_linear_2022_136" x1="7.85426" y1="94.8177" x2="17.2742" y2="99.6033" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint11_linear_2022_136" x1="8.5255" y1="90.4703" x2="13.0174" y2="96.0319" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint12_linear_2022_136" x1="9.55677" y1="86.8642" x2="12.676" y2="92.2577" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint13_linear_2022_136" x1="63.8063" y1="99.2351" x2="64.9118" y2="97.0146" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint14_linear_2022_136" x1="57.1691" y1="95.1901" x2="58.2558" y2="93.9783" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint15_linear_2022_136" x1="78.0744" y1="100.481" x2="66.4415" y2="98.6657" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint16_linear_2022_136" x1="84.0141" y1="97.0072" x2="74.2947" y2="101.151" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint17_linear_2022_136" x1="83.6356" y1="92.6247" x2="78.7811" y2="97.8728" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint18_linear_2022_136" x1="82.8481" y1="88.9575" x2="79.3745" y2="94.1298" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint19_linear_2022_136" x1="70.0423" y1="93.4095" x2="69.8418" y2="90.3119" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint20_linear_2022_136" x1="60.6846" y1="93.1835" x2="61.1182" y2="91.1964" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint21_linear_2022_136" x1="85.6683" y1="85.8224" x2="72.3169" y2="90.7944" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint22_linear_2022_136" x1="89.767" y1="78.3373" x2="81.7502" y2="88.6182" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint23_linear_2022_136" x1="86.7312" y1="73.8258" x2="84.6887" y2="82.5194" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint24_linear_2022_136" x1="83.7004" y1="70.3456" x2="83.1559" y2="78.1232" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint25_linear_2022_136" x1="23.0739" y1="16.996" x2="23.2744" y2="20.0936" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint26_linear_2022_136" x1="32.4316" y1="17.2221" x2="31.998" y2="19.2091" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint27_linear_2022_136" x1="7.44795" y1="24.5831" x2="20.7993" y2="19.6111" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint28_linear_2022_136" x1="3.34926" y1="32.0682" x2="11.366" y2="21.7873" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint29_linear_2022_136" x1="6.38501" y1="36.5797" x2="8.42756" y2="27.8861" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint30_linear_2022_136" x1="9.41589" y1="40.0599" x2="9.96039" y2="32.2823" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint31_linear_2022_136" x1="27.8674" y1="12.0107" x2="26.9132" y2="14.3003" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint32_linear_2022_136" x1="34.7607" y1="15.6022" x2="33.7575" y2="16.8841" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint33_linear_2022_136" x1="13.5477" y1="11.7236" x2="25.2761" y2="12.7559" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint34_linear_2022_136" x1="7.85426" y1="15.5879" x2="17.2742" y2="10.8022" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint35_linear_2022_136" x1="8.5255" y1="19.9352" x2="13.0174" y2="14.3736" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint36_linear_2022_136" x1="9.55677" y1="23.5413" x2="12.676" y2="18.1479" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint37_linear_2022_136" x1="63.8063" y1="11.1704" x2="64.9118" y2="13.3909" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint38_linear_2022_136" x1="57.1691" y1="15.2154" x2="58.2558" y2="16.4272" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint39_linear_2022_136" x1="78.0744" y1="9.92403" x2="66.4415" y2="11.7399" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint40_linear_2022_136" x1="84.0141" y1="13.3984" x2="74.2947" y2="9.25466" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint41_linear_2022_136" x1="83.6356" y1="17.7808" x2="78.7811" y2="12.5327" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint42_linear_2022_136" x1="82.8481" y1="21.448" x2="79.3745" y2="16.2757" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint43_linear_2022_136" x1="70.0423" y1="16.996" x2="69.8418" y2="20.0936" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint44_linear_2022_136" x1="60.6846" y1="17.2221" x2="61.1182" y2="19.2091" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint45_linear_2022_136" x1="85.6683" y1="24.5831" x2="72.3169" y2="19.6111" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint46_linear_2022_136" x1="89.767" y1="32.0682" x2="81.7502" y2="21.7873" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint47_linear_2022_136" x1="86.7312" y1="36.5797" x2="84.6887" y2="27.8861" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint48_linear_2022_136" x1="83.7004" y1="40.0599" x2="83.1559" y2="32.2823" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}