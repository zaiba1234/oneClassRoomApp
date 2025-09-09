import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => {
  const { filled = false, color = "white", ...rest } = props;
  
  return (
    <Svg
      width={28}
      height={28}
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      {/* House outline */}
      <Path
        d="M18.8771 25.6666H9.12292C6.42939 25.6666 4.24585 23.5829 4.24585 21.0125V15.3218C4.24585 14.4955 3.90189 13.7031 3.28963 13.1188C1.8711 11.7652 2.05551 9.52231 3.67792 8.39632L11.1314 3.22341C12.8416 2.03653 15.1584 2.03653 16.8686 3.22341L24.3221 8.39632C25.9445 9.52231 26.1289 11.7652 24.7104 13.1188C24.0981 13.7031 23.7541 14.4955 23.7541 15.3218V21.0125C23.7541 23.5829 21.5706 25.6666 18.8771 25.6666Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill={filled ? color : "none"}
      />
      {/* Door line */}
      <Path
        d="M11.6667 20.9999H16.3333"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
    </Svg>
  );
};
export default SVGComponent;
