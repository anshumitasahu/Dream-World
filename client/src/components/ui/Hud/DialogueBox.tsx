import type { ReactNode } from 'react'

const VIEW_WIDTH = 298
const VIEW_HEIGHT = 112
const BOX_LEFT = 12.5
const BOX_TOP = 22.5
const BOX_WIDTH = 273
const BOX_HEIGHT = 67

interface DialogueBoxProps {
  /** Sizing classes for the frame — controls its rendered width. */
  className?: string
  /** Layout classes for the content overlay; positioning is applied automatically. */
  contentClassName?: string
  children: ReactNode
}

export default function DialogueBox({
  className = 'w-125',
  contentClassName = 'flex-col justify-center gap-1 px-8 text-left text-sm',
  children,
}: DialogueBoxProps) {
  const overlayStyle = {
    left: `${(BOX_LEFT / VIEW_WIDTH) * 100}%`,
    top: `${(BOX_TOP / VIEW_HEIGHT) * 100}%`,
    width: `${(BOX_WIDTH / VIEW_WIDTH) * 100}%`,
    height: `${(BOX_HEIGHT / VIEW_HEIGHT) * 100}%`,
  }

  return (
    <div className="relative w-full min-w-0">
      <svg className={className} viewBox="0 0 298 112" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12.5" y="22.5" width="273" height="67" fill="url(#paint0_linear_2023_267)" fill-opacity="0.7" stroke="url(#paint1_linear_2023_267)" stroke-width="3" />
        <path d="M25.8017 90.0935C21.1336 91.8708 18.5579 92.1824 13.9963 92.2021C13.9963 92.2021 18.7213 93.3988 21.9958 93.453C24.9689 93.5023 29.5894 92.6568 29.5894 92.6568L34.788 88.8029L25.8017 90.0935Z" fill="url(#paint2_linear_2023_267)" />
        <path d="M34.2186 92.7969C37.6293 91.2488 40.9071 87.9683 40.9071 87.9683L33.8252 88.934C29.8184 92.0937 26.9562 93.5652 20.8416 95.6941C20.8416 95.6941 30.3829 94.538 34.2186 92.7969Z" fill="url(#paint3_linear_2023_267)" />
        <path d="M15.5298 90.1143C20.5025 91.6774 29.3986 90.3289 29.3986 90.3289L19.0708 87.1098C14.4805 87.1176 12.0663 86.7349 7.85767 85.6076C7.85767 85.6076 11.9945 89.003 15.5298 90.1143Z" fill="url(#paint4_linear_2023_267)" />
        <path d="M8.80602 84.3011C12.7346 87.2782 22.0466 89.1448 22.0466 89.1448L13.8721 82.9846C9.44637 81.4472 7.33184 80.3158 3.89903 77.9595C3.89903 77.9595 6.01302 82.1846 8.80602 84.3011Z" fill="url(#paint5_linear_2023_267)" />
        <path d="M8.22813 78.8653C9.78307 81.8518 15.3165 85.6166 15.3165 85.6166L12.0689 79.4244C9.67044 77.2199 8.66582 75.9132 7.21991 73.4601C7.21991 73.4601 7.12267 76.7421 8.22813 78.8653Z" fill="url(#paint6_linear_2023_267)" />
        <path d="M8.87677 74.9156C8.9922 77.7633 12.6166 81.8248 12.6166 81.8248L12.3542 75.9174C11.0514 73.6503 10.6852 72.3615 10.4262 70.0002C10.4262 70.0002 8.7947 72.8912 8.87677 74.9156Z" fill="url(#paint7_linear_2023_267)" />
        <path d="M28.9858 95.3841C26.1339 98.3692 24.3244 99.5366 20.9322 101.223C20.9322 101.223 24.8751 100.349 27.3343 99.1877C29.5672 98.1333 32.7121 95.8337 32.7121 95.8337L35.227 91.1654L28.9858 95.3841Z" fill="url(#paint8_linear_2023_267)" />
        <path d="M36.2108 94.2378C38.2065 91.8779 39.4923 88.3246 39.4923 88.3246L34.5555 91.6124C32.6839 95.3462 31.0699 97.4502 27.2642 101.218C27.2642 101.218 33.9665 96.8918 36.2108 94.2378Z" fill="url(#paint9_linear_2023_267)" />
        <path d="M21.3388 99.1634C25.5955 98.4617 31.7492 94.2345 31.7492 94.2345L22.918 95.7116C19.5002 97.3995 17.5663 98.0099 14.0325 98.7441C14.0325 98.7441 18.3125 99.6623 21.3388 99.1634Z" fill="url(#paint10_linear_2023_267)" />
        <path d="M14.2785 97.46C18.2558 98.1546 25.853 96.0802 25.853 96.0802L17.5894 94.6594C13.7493 95.1792 11.7747 95.143 8.38574 94.7117C8.38574 94.7117 11.4509 96.9662 14.2785 97.46Z" fill="url(#paint11_linear_2023_267)" />
        <path d="M11.9309 93.7744C14.1427 95.3457 19.5936 96.017 19.5936 96.017L14.9901 92.7677C12.4255 92.0661 11.2161 91.4974 9.27362 90.2686C9.27362 90.2686 10.3584 92.6573 11.9309 93.7744Z" fill="url(#paint12_linear_2023_267)" />
        <path d="M11.0216 90.7047C12.1118 92.7041 16.2448 94.2877 16.2448 94.2877L13.9662 90.1485C12.196 89.0005 11.4686 88.2107 10.4429 86.6127C10.4429 86.6127 10.2466 89.2833 11.0216 90.7047Z" fill="url(#paint13_linear_2023_267)" />
        <path d="M268.099 97.2233C270.745 100.393 272.472 101.679 275.744 103.588C275.744 103.588 271.868 102.452 269.492 101.129C267.335 99.9273 264.351 97.4222 264.351 97.4222L262.155 92.5958L268.099 97.2233Z" fill="url(#paint14_linear_2023_267)" />
        <path d="M260.967 95.5956C259.134 93.1073 258.089 89.4758 258.089 89.4758L262.795 93.0871C264.412 96.9379 265.881 99.1453 269.426 103.159C269.426 103.159 263.029 98.3941 260.967 95.5956Z" fill="url(#paint15_linear_2023_267)" />
        <path d="M275.476 101.507C271.276 100.522 265.419 95.8915 265.419 95.8915L274.132 97.957C277.429 99.8701 279.317 100.609 282.794 101.578C282.794 101.578 278.462 102.207 275.476 101.507Z" fill="url(#paint16_linear_2023_267)" />
        <path d="M282.634 100.28C278.62 100.707 271.178 98.1278 271.178 98.1278L279.519 97.264C283.315 98.0399 285.288 98.1361 288.698 97.9328C288.698 97.9328 285.489 99.9769 282.634 100.28Z" fill="url(#paint17_linear_2023_267)" />
        <path d="M285.224 96.7602C282.912 98.1798 277.428 98.4843 277.428 98.4843L282.239 95.5507C284.845 95.0226 286.089 94.5363 288.11 93.4403C288.11 93.4403 286.867 95.7509 285.224 96.7602Z" fill="url(#paint18_linear_2023_267)" />
        <path d="M286.337 93.7583C285.115 95.6801 280.885 96.9832 280.885 96.9832L283.436 93.006C285.279 91.9792 286.058 91.2399 287.188 89.7142C287.188 89.7142 287.205 92.392 286.337 93.7583Z" fill="url(#paint19_linear_2023_267)" />
        <path d="M272.524 91.0935C277.192 92.8708 279.768 93.1824 284.329 93.2021C284.329 93.2021 279.604 94.3988 276.33 94.453C273.357 94.5023 268.736 93.6568 268.736 93.6568L263.538 89.8029L272.524 91.0935Z" fill="url(#paint20_linear_2023_267)" />
        <path d="M264.107 93.7969C260.696 92.2488 257.419 88.9683 257.419 88.9683L264.501 89.934C268.507 93.0937 271.37 94.5652 277.484 96.6941C277.484 96.6941 267.943 95.538 264.107 93.7969Z" fill="url(#paint21_linear_2023_267)" />
        <path d="M282.796 91.1143C277.823 92.6774 268.927 91.3289 268.927 91.3289L279.255 88.1098C283.845 88.1176 286.259 87.7349 290.468 86.6076C290.468 86.6076 286.331 90.003 282.796 91.1143Z" fill="url(#paint22_linear_2023_267)" />
        <path d="M289.52 85.3011C285.591 88.2782 276.279 90.1448 276.279 90.1448L284.454 83.9846C288.879 82.4472 290.994 81.3158 294.427 78.9595C294.427 78.9595 292.313 83.1846 289.52 85.3011Z" fill="url(#paint23_linear_2023_267)" />
        <path d="M290.098 79.8653C288.543 82.8518 283.009 86.6166 283.009 86.6166L286.257 80.4244C288.655 78.2199 289.66 76.9132 291.106 74.4601C291.106 74.4601 291.203 77.7421 290.098 79.8653Z" fill="url(#paint24_linear_2023_267)" />
        <path d="M289.449 75.9156C289.333 78.7633 285.709 82.8248 285.709 82.8248L285.971 76.9174C287.274 74.6503 287.64 73.3615 287.9 71.0002C287.9 71.0002 289.531 73.8912 289.449 75.9156Z" fill="url(#paint25_linear_2023_267)" />
        <path d="M24.8017 21.3118C20.1336 19.5345 17.5579 19.2229 12.9963 19.2031C12.9963 19.2031 17.7213 18.0065 20.9958 17.9522C23.9689 17.903 28.5894 18.7485 28.5894 18.7485L33.788 22.6024L24.8017 21.3118Z" fill="url(#paint26_linear_2023_267)" />
        <path d="M33.2186 18.6083C36.6293 20.1565 39.9071 23.437 39.9071 23.437L32.8252 22.4712C28.8184 19.3116 25.9562 17.8401 19.8416 15.7112C19.8416 15.7112 29.3829 16.8673 33.2186 18.6083Z" fill="url(#paint27_linear_2023_267)" />
        <path d="M14.5298 21.291C19.5025 19.7278 28.3986 21.0764 28.3986 21.0764L18.0708 24.2955C13.4805 24.2877 11.0663 24.6704 6.85767 25.7977C6.85767 25.7977 10.9945 22.4023 14.5298 21.291Z" fill="url(#paint28_linear_2023_267)" />
        <path d="M7.80602 27.1042C11.7346 24.1271 21.0466 22.2605 21.0466 22.2605L12.8721 28.4207C8.44637 29.9581 6.33184 31.0894 2.89903 33.4458C2.89903 33.4458 5.01302 29.2207 7.80602 27.1042Z" fill="url(#paint29_linear_2023_267)" />
        <path d="M7.22813 32.54C8.78307 29.5535 14.3165 25.7887 14.3165 25.7887L11.0689 31.9808C8.67044 34.1854 7.66582 35.4921 6.21991 37.9452C6.21991 37.9452 6.12267 34.6632 7.22813 32.54Z" fill="url(#paint30_linear_2023_267)" />
        <path d="M7.87677 36.4896C7.9922 33.642 11.6166 29.5805 11.6166 29.5805L11.3542 35.4879C10.0514 37.755 9.68521 39.0438 9.42617 41.4051C9.42617 41.4051 7.7947 38.5141 7.87677 36.4896Z" fill="url(#paint31_linear_2023_267)" />
        <path d="M27.9858 16.0211C25.1339 13.036 23.3244 11.8686 19.9322 10.1827C19.9322 10.1827 23.8751 11.0564 26.3343 12.2176C28.5672 13.272 31.7121 15.5715 31.7121 15.5715L34.227 20.2399L27.9858 16.0211Z" fill="url(#paint32_linear_2023_267)" />
        <path d="M35.2108 17.1675C37.2065 19.5274 38.4923 23.0807 38.4923 23.0807L33.5555 19.7928C31.6839 16.059 30.0699 13.9551 26.2642 10.1877C26.2642 10.1877 32.9665 14.5135 35.2108 17.1675Z" fill="url(#paint33_linear_2023_267)" />
        <path d="M20.3388 12.2418C24.5955 12.9436 30.7492 17.1708 30.7492 17.1708L21.918 15.6937C18.5002 14.0058 16.5663 13.3954 13.0325 12.6612C13.0325 12.6612 17.3125 11.7429 20.3388 12.2418Z" fill="url(#paint34_linear_2023_267)" />
        <path d="M13.2785 13.9453C17.2558 13.2506 24.853 15.3251 24.853 15.3251L16.5894 16.7458C12.7493 16.2261 10.7747 16.2623 7.38574 16.6936C7.38574 16.6936 10.4509 14.4391 13.2785 13.9453Z" fill="url(#paint35_linear_2023_267)" />
        <path d="M10.9309 17.6309C13.1427 16.0596 18.5936 15.3883 18.5936 15.3883L13.9901 18.6376C11.4255 19.3392 10.2161 19.9078 8.27362 21.1367C8.27362 21.1367 9.35845 18.748 10.9309 17.6309Z" fill="url(#paint36_linear_2023_267)" />
        <path d="M10.0216 20.7005C11.1118 18.7012 15.2448 17.1176 15.2448 17.1176L12.9662 21.2568C11.196 22.4048 10.4686 23.1945 9.44295 24.7926C9.44295 24.7926 9.24663 22.1219 10.0216 20.7005Z" fill="url(#paint37_linear_2023_267)" />
        <path d="M267.099 14.182C269.745 11.0125 271.472 9.72649 274.744 7.81705C274.744 7.81705 270.868 8.95297 268.492 10.2764C266.335 11.4779 263.351 13.9831 263.351 13.9831L261.155 18.8094L267.099 14.182Z" fill="url(#paint38_linear_2023_267)" />
        <path d="M259.967 15.8096C258.134 18.298 257.089 21.9294 257.089 21.9294L261.795 18.3182C263.412 14.4673 264.881 12.26 268.426 8.24609C268.426 8.24609 262.029 13.0112 259.967 15.8096Z" fill="url(#paint39_linear_2023_267)" />
        <path d="M274.476 9.89836C270.276 10.8838 264.419 15.5138 264.419 15.5138L273.132 13.4482C276.429 11.5351 278.317 10.7965 281.794 9.82721C281.794 9.82721 277.462 9.1978 274.476 9.89836Z" fill="url(#paint40_linear_2023_267)" />
        <path d="M281.634 11.1251C277.62 10.6986 270.178 13.2774 270.178 13.2774L278.519 14.1413C282.315 13.3653 284.288 13.2692 287.698 13.4724C287.698 13.4724 284.489 11.4284 281.634 11.1251Z" fill="url(#paint41_linear_2023_267)" />
        <path d="M284.224 14.6451C281.912 13.2255 276.428 12.921 276.428 12.921L281.239 15.8545C283.845 16.3827 285.089 16.869 287.11 17.965C287.11 17.965 285.867 15.6543 284.224 14.6451Z" fill="url(#paint42_linear_2023_267)" />
        <path d="M285.337 17.647C284.115 15.7252 279.885 14.422 279.885 14.422L282.436 18.3993C284.279 19.4261 285.058 20.1653 286.188 21.6911C286.188 21.6911 286.205 19.0133 285.337 17.647Z" fill="url(#paint43_linear_2023_267)" />
        <path d="M271.524 20.3118C276.192 18.5345 278.768 18.2229 283.329 18.2031C283.329 18.2031 278.604 17.0065 275.33 16.9522C272.357 16.903 267.736 17.7485 267.736 17.7485L262.538 21.6024L271.524 20.3118Z" fill="url(#paint44_linear_2023_267)" />
        <path d="M263.107 17.6083C259.696 19.1565 256.419 22.437 256.419 22.437L263.501 21.4712C267.507 18.3116 270.37 16.8401 276.484 14.7112C276.484 14.7112 266.943 15.8673 263.107 17.6083Z" fill="url(#paint45_linear_2023_267)" />
        <path d="M281.796 20.291C276.823 18.7278 267.927 20.0764 267.927 20.0764L278.255 23.2955C282.845 23.2877 285.259 23.6704 289.468 24.7977C289.468 24.7977 285.331 21.4023 281.796 20.291Z" fill="url(#paint46_linear_2023_267)" />
        <path d="M288.52 26.1042C284.591 23.1271 275.279 21.2605 275.279 21.2605L283.454 27.4207C287.879 28.9581 289.994 30.0894 293.427 32.4458C293.427 32.4458 291.313 28.2207 288.52 26.1042Z" fill="url(#paint47_linear_2023_267)" />
        <path d="M289.098 31.54C287.543 28.5535 282.009 24.7887 282.009 24.7887L285.257 30.9808C287.655 33.1854 288.66 34.4921 290.106 36.9452C290.106 36.9452 290.203 33.6632 289.098 31.54Z" fill="url(#paint48_linear_2023_267)" />
        <path d="M288.449 35.4896C288.333 32.642 284.709 28.5805 284.709 28.5805L284.971 34.4879C286.274 36.755 286.64 38.0438 286.9 40.4051C286.9 40.4051 288.531 37.5141 288.449 35.4896Z" fill="url(#paint49_linear_2023_267)" />
        <defs>
          <linearGradient id="paint0_linear_2023_267" x1="149" y1="21" x2="149" y2="91" gradientUnits="userSpaceOnUse">
            <stop />
            <stop offset="1" />
          </linearGradient>
          <linearGradient id="paint1_linear_2023_267" x1="149" y1="21" x2="149" y2="91" gradientUnits="userSpaceOnUse">
            <stop stop-color="#160B25" />
            <stop offset="0.451923" stop-color="#43216D" />
            <stop offset="1" stop-color="#0B0514" />
          </linearGradient>
          <linearGradient id="paint2_linear_2023_267" x1="24.074" y1="93.4092" x2="24.2746" y2="90.3116" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint3_linear_2023_267" x1="33.4317" y1="93.1832" x2="32.9982" y2="91.1961" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint4_linear_2023_267" x1="8.44783" y1="85.8222" x2="21.7992" y2="90.7942" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint5_linear_2023_267" x1="4.34926" y1="78.3371" x2="12.366" y2="88.6179" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint6_linear_2023_267" x1="7.38514" y1="73.8256" x2="9.42768" y2="82.5192" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint7_linear_2023_267" x1="10.4159" y1="70.3454" x2="10.9604" y2="78.123" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint8_linear_2023_267" x1="28.8675" y1="98.3946" x2="27.9133" y2="96.105" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint9_linear_2023_267" x1="35.7607" y1="94.8031" x2="34.7575" y2="93.5212" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint10_linear_2023_267" x1="14.548" y1="98.6817" x2="26.2763" y2="97.6494" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint11_linear_2023_267" x1="8.85439" y1="94.8174" x2="18.2743" y2="99.603" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint12_linear_2023_267" x1="9.52563" y1="90.4701" x2="14.0176" y2="96.0317" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint13_linear_2023_267" x1="10.557" y1="86.8639" x2="13.6763" y2="92.2574" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint14_linear_2023_267" x1="268.016" y1="100.235" x2="269.121" y2="98.0144" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint15_linear_2023_267" x1="261.378" y1="96.1899" x2="262.465" y2="94.9781" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint16_linear_2023_267" x1="282.284" y1="101.481" x2="270.651" y2="99.6654" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint17_linear_2023_267" x1="288.223" y1="98.0069" x2="278.504" y2="102.151" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint18_linear_2023_267" x1="287.845" y1="93.6245" x2="282.99" y2="98.8726" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint19_linear_2023_267" x1="287.057" y1="89.9573" x2="283.584" y2="95.1296" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint20_linear_2023_267" x1="274.252" y1="94.4092" x2="274.051" y2="91.3116" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint21_linear_2023_267" x1="264.894" y1="94.1832" x2="265.328" y2="92.1961" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint22_linear_2023_267" x1="289.878" y1="86.8222" x2="276.526" y2="91.7942" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint23_linear_2023_267" x1="293.976" y1="79.3371" x2="285.96" y2="89.6179" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint24_linear_2023_267" x1="290.941" y1="74.8256" x2="288.898" y2="83.5192" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint25_linear_2023_267" x1="287.91" y1="71.3454" x2="287.365" y2="79.123" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint26_linear_2023_267" x1="23.074" y1="17.996" x2="23.2746" y2="21.0936" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint27_linear_2023_267" x1="32.4317" y1="18.2221" x2="31.9982" y2="20.2091" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint28_linear_2023_267" x1="7.44783" y1="25.5831" x2="20.7992" y2="20.6111" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint29_linear_2023_267" x1="3.34926" y1="33.0682" x2="11.366" y2="22.7873" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint30_linear_2023_267" x1="6.38514" y1="37.5797" x2="8.42768" y2="28.8861" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint31_linear_2023_267" x1="9.41589" y1="41.0599" x2="9.96039" y2="33.2823" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint32_linear_2023_267" x1="27.8675" y1="13.0107" x2="26.9133" y2="15.3003" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint33_linear_2023_267" x1="34.7607" y1="16.6022" x2="33.7575" y2="17.8841" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint34_linear_2023_267" x1="13.548" y1="12.7236" x2="25.2763" y2="13.7559" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint35_linear_2023_267" x1="7.85439" y1="16.5879" x2="17.2743" y2="11.8022" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint36_linear_2023_267" x1="8.52563" y1="20.9352" x2="13.0176" y2="15.3736" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint37_linear_2023_267" x1="9.55701" y1="24.5413" x2="12.6763" y2="19.1479" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint38_linear_2023_267" x1="267.016" y1="11.1704" x2="268.121" y2="13.3909" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint39_linear_2023_267" x1="260.378" y1="15.2154" x2="261.465" y2="16.4272" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint40_linear_2023_267" x1="281.284" y1="9.92403" x2="269.651" y2="11.7399" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint41_linear_2023_267" x1="287.223" y1="13.3984" x2="277.504" y2="9.25466" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint42_linear_2023_267" x1="286.845" y1="17.7808" x2="281.99" y2="12.5327" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint43_linear_2023_267" x1="286.057" y1="21.448" x2="282.584" y2="16.2757" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint44_linear_2023_267" x1="273.252" y1="16.996" x2="273.051" y2="20.0936" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5C27B1" />
            <stop offset="1" stop-color="#101116" />
          </linearGradient>
          <linearGradient id="paint45_linear_2023_267" x1="263.894" y1="17.2221" x2="264.328" y2="19.2091" gradientUnits="userSpaceOnUse">
            <stop stop-color="#5D24BC" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint46_linear_2023_267" x1="288.878" y1="24.5831" x2="275.526" y2="19.6111" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint47_linear_2023_267" x1="292.976" y1="32.0682" x2="284.96" y2="21.7873" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint48_linear_2023_267" x1="289.941" y1="36.5797" x2="287.898" y2="27.8861" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
          <linearGradient id="paint49_linear_2023_267" x1="286.91" y1="40.0599" x2="286.365" y2="32.2823" gradientUnits="userSpaceOnUse">
            <stop stop-color="#6226C4" />
            <stop offset="1" stop-color="#16092C" />
          </linearGradient>
        </defs>
      </svg>
      <div className={`absolute flex overflow-hidden font-mono text-white ${contentClassName}`} style={overlayStyle}>
        {children}
      </div>
    </div>
  )
}