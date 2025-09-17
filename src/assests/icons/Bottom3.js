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
        d="M2.83333 4.66659C2.83333 3.37792 3.878 2.33325 5.16666 2.33325H9.83333C11.122 2.33325 12.1667 3.37792 12.1667 4.66659V9.33325C12.1667 10.6219 11.122 11.6666 9.83333 11.6666H5.16666C3.878 11.6666 2.83333 10.6219 2.83333 9.33325V4.66659Z"
        stroke={color}
        strokeWidth={1.5}
        fill={filled ? color : "none"}
      />
      <Path
        d="M26.1667 6.99992C26.1667 9.57725 24.0773 11.6666 21.5 11.6666C18.9227 11.6666 16.8333 9.57725 16.8333 6.99992C16.8333 4.42259 18.9227 2.33325 21.5 2.33325C24.0773 2.33325 26.1667 4.42259 26.1667 6.99992Z"
        stroke={color}
        strokeWidth={1.5}
        fill={filled ? color : "none"}
      />
      <Path
        d="M12.1667 20.9999C12.1667 23.5772 10.0773 25.6666 7.49999 25.6666C4.92267 25.6666 2.83333 23.5772 2.83333 20.9999C2.83333 18.4226 4.92267 16.3333 7.49999 16.3333C10.0773 16.3333 12.1667 18.4226 12.1667 20.9999Z"
        stroke={color}
        strokeWidth={1.5}
        fill={filled ? color : "none"}
      />
      <Path
        d="M16.8333 18.6666C16.8333 17.3779 17.878 16.3333 19.1667 16.3333H23.8333C25.122 16.3333 26.1667 17.3779 26.1667 18.6666V23.3333C26.1667 24.6219 25.122 25.6666 23.8333 25.6666H19.1667C17.878 25.6666 16.8333 24.6219 16.8333 23.3333V18.6666Z"
        stroke={color}
        strokeWidth={1.5}
        fill={filled ? color : "none"}
      />
    </Svg>
  );
};
export default SVGComponent;

