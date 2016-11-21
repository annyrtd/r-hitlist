import Hitlist from "./hitlist";
import ReportalBase from "r-reporal-base/src/reportal-base"
window.Reportal = window.Reportal || {};
ReportalBase.mixin(window.Reportal,{
  Hitlist
});
