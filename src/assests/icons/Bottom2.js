import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => {
  const { filled = false, color = "white", ...rest } = props;
  
  return (
    <Svg
      width={23}
      height={26}
      viewBox="0 0 23 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <Path
        d="M6.58333 10.6667H15.9167M6.58333 15.3334H15.9167M6.58333 20H11.25M6.58333 3.66671C6.58333 4.95537 7.628 6.00004 8.91667 6.00004H13.5833C14.872 6.00004 15.9167 4.95537 15.9167 3.66671M6.58333 3.66671C6.58333 2.37804 7.628 1.33337 8.91667 1.33337H13.5833C14.872 1.33337 15.9167 2.37804 15.9167 3.66671M6.58333 3.66671H5.41667C2.83934 3.66671 0.75 5.75605 0.75 8.33337V20C0.75 22.5774 2.83934 24.6667 5.41667 24.6667H17.0833C19.6607 24.6667 21.75 22.5774 21.75 20V8.33337C21.75 5.75605 19.6607 3.66671 17.0833 3.66671H15.9167"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill={filled ? color : "none"}
      />
    </Svg>
  );
};
export default SVGComponent;
