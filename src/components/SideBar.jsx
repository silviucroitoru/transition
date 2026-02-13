import "./styles/sidebar.css";
import { useIntl } from "react-intl";
import mixpanel from "mixpanel-browser";
import { brand } from "../config/brand";

export default function SideBar({scoreSummary}) {
  const intl = useIntl();
  return (
    <div className="sidebar">
      <div className="logo">
        <a href={brand.logo.link}>
          <img src={brand.logo.src} alt={brand.logo.alt} />
        </a>
      </div>
      <div className="dashboardMenu">
        {scoreSummary.stageTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Stage`, {source: 'SideBar'})
                    document.getElementById(scoreSummary.stageTitle).scrollIntoView({behavior: "smooth"})}
                  }
          >
            {scoreSummary.stageTitle}
          </button>
        )}
        {scoreSummary.scoreTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Score`, {source: 'SideBar'})
                    document.getElementById(scoreSummary.scoreTitle).scrollIntoView({behavior: "smooth"})
                  }}
          >
            {scoreSummary.scoreTitle}
          </button>
        )}
        {scoreSummary.symptomsTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Symptoms"`, {source: 'SideBar'})
                    document.getElementById('symptoms').scrollIntoView({behavior: "smooth"})
                  }}
          >
            {scoreSummary.symptomsTitle}
          </button>
        )}
        {scoreSummary.recommendationsTitle && (
          <button className="menuLink"
                  onClick={() => {
                    mixpanel.track(`Dashboard-Sidebar Select Recommendations"`, {source: 'SideBar'})
                    document.getElementById('recommendations').scrollIntoView({behavior: "smooth"})
                  }}
          >
            {scoreSummary.recommendationsTitle}
          </button>
        )}
        <button className="menuLink"
                onClick={() => {
                  mixpanel.track(`Dashboard-Sidebar Select What's next`, {source: 'SideBar'})
                  document.getElementById('whats_next').scrollIntoView({behavior: "smooth"})
                }}
        >
          <span>{intl.formatMessage({ id: "whats_next_sidebar_title" })}</span>
        </button>
        <button className="menuLink"
                onClick={() => {
                  mixpanel.track(`Dashboard-Sidebar Select Book a call`, {source: 'SideBar'})
                  document.getElementById('book_call').scrollIntoView({behavior: "smooth"})
                }}
        >
          <span>{intl.formatMessage({ id: "book_call_sidebar_title" })}</span>
        </button>
      </div>
    </div>
  );
}