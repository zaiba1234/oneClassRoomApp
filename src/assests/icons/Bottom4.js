import * as React from "react";
import Svg, { Path } from "react-native-svg";
const SVGComponent = (props) => {
  const { filled = false, color = "white", ...rest } = props;
  
  return (
    <Svg
      width={29}
      height={28}
      viewBox="0 0 29 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <Path
        d="M20.5833 7.58327C21.872 7.58327 22.9166 8.62794 22.9166 9.9166M14.75 6.65289L15.5492 5.83327C18.0353 3.28377 22.066 3.28377 24.5521 5.83327C26.9714 8.3143 27.0457 12.3127 24.7204 14.8865L18.0397 22.2811C16.2648 24.2456 13.2351 24.2456 11.4603 22.2811L4.77958 14.8865C2.45424 12.3127 2.52858 8.31433 4.94789 5.83329C7.43397 3.28378 11.4647 3.28378 13.9508 5.83329L14.75 6.65289Z"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : "none"}
      />
    </Svg>
  );
};
export default SVGComponent;
