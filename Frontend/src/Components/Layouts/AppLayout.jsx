import { Headers } from "../UI/Headers";
import { Footers } from "../UI/Footers";
import { Outlet } from "react-router-dom";

export const AppLayout = () => {
  return (
    <>
      <Headers />
      <div className="content-container">
        <Outlet />
      </div>
      <Footers />
    </>
  );
};