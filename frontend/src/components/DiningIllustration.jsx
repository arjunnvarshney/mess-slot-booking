export default function DiningIllustration() {
  return (
    <div className="hero-emblem" aria-hidden="true">
      <svg className="dining-illustration" viewBox="0 0 360 260" fill="none">
        <ellipse
          cx="185"
          cy="229"
          rx="126"
          ry="12"
          fill="#091C32"
          opacity=".25"
        />
        <path d="M36 62H312M36 190H312" stroke="#FFFFFF" strokeOpacity=".08" />
        <circle cx="184" cy="127" r="99" fill="#F4EDDF" />
        <circle cx="184" cy="127" r="83" stroke="#D6CBB7" strokeWidth="2" />
        <circle cx="184" cy="127" r="72" fill="#E8DDC8" />
        <path
          d="M129 125C127 97 151 76 175 83C192 66 220 83 226 107C253 121 232 156 208 156C201 179 166 183 152 161C130 160 117 140 129 125Z"
          fill="#648B67"
        />
        <path
          d="M138 126L177 104M158 154L207 106M183 158L222 134"
          stroke="#ABC58C"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="153" cy="112" r="13" fill="#D77854" />
        <circle cx="204" cy="144" r="13" fill="#D77854" />
        <circle cx="153" cy="112" r="7" stroke="#F4B390" strokeWidth="2" />
        <circle cx="204" cy="144" r="7" stroke="#F4B390" strokeWidth="2" />
        <path d="M183 116L199 123L190 137L175 129Z" fill="#F3D382" />
        <path d="M158 144L170 139L176 151L162 158Z" fill="#F3D382" />
        <path
          d="M68 61V91C68 104 51 104 51 91V61M59.5 61V204"
          stroke="#EBC778"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M310 62C294 83 293 107 305 116H311V204"
          stroke="#EBC778"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M276 39L280 30M289 45L299 42"
          stroke="#EBC778"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="89" cy="205" r="3" fill="#EBC778" />
      </svg>
      <span className="plate-caption">A good meal. A well-earned break.</span>
    </div>
  );
}
