import Hitlist from "./hitlist";
import ReportalBase from "r-reportal-base"

window.Reportal = window.Reportal || {};
ReportalBase.mixin(window.Reportal,{
  Hitlist
});

export default Hitlist
