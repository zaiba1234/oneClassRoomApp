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
      <Path
        d="M14 12C16.2091 12 18 10.2091 18 8C18 5.79086 16.2091 4 14 4C11.7909 4 10 5.79086 10 8C10 10.2091 11.7909 12 14 12Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={1.5}
      />
      <Path
        d="M6 22C6 18.6863 8.68629 16 12 16H16C19.3137 16 22 18.6863 22 22V24H6V22Z"
        fill={filled ? color : "none"}
        stroke={color}
        strokeWidth={1.5}
      />
    </Svg>
  );
};
export default SVGComponent;
