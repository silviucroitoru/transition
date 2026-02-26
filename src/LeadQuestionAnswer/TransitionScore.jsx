import { useState, useEffect } from "react";
import "./transition-score.css";
import 'swiper/css';
import { FormattedMessage, useIntl } from "react-intl";
import virginiaImage from '../assets/virginia-lazar.png';
import mixpanel from "mixpanel-browser";
import { brand } from '../config/brand';

export default function TransitionScore({scoreJson, scoreSummary}) {
  const intl = useIntl();
  const [arrowPosition, setArrowPosition] = useState(0);
  const [index, setIndex] = useState(-1);
  const [currentTab, setCurrentTab] = useState("high");
  const [lineWidth, setLineWidth] = useState(0);
  const [stage0Width, setStage0Width] = useState(0);
  const [stage1Width, setStage1Width] = useState(0);
  const [stage2Width, setStage2Width] = useState(0);
  const [stage3Width, setStage3Width] = useState(0);
  const language = localStorage.getItem('language')?.toLowerCase() ?? 'en';
  const defaultStages = [
    intl.formatMessage({ id: "premenopause" }),
    intl.formatMessage({ id: "perimenopause" }),
    intl.formatMessage({ id: "menopause" }),
    intl.formatMessage({ id: "postmenopause" }),
  ];
  const stages = (scoreJson.transitionStage?.stages && scoreJson.transitionStage.stages.length === 4)
    ? scoreJson.transitionStage.stages
    : defaultStages;
  useEffect(() => {
    mixpanel.track('[Page View] Dashboard', {source: 'Dashboard'})
    const el0 = document.getElementById('stage0');
    const el1 = document.getElementById('stage1');
    const el2 = document.getElementById('stage2');
    const el3 = document.getElementById('stage3');
    if (el0) setStage0Width(-6 + el0.offsetWidth / 2);
    if (el1) setStage1Width(-6 + el1.offsetWidth / 2);
    if (el2) setStage2Width(-6 + el2.offsetWidth / 2);
    if (el3) setStage3Width(-6 + el3.offsetWidth / 2);
  }, [])
  useEffect(() => {
    setTimeout(() => {
      const stage = scoreJson?.transitionStage?.stage;
      const indexOfStage = stage != null ? stages.indexOf(stage) : -1;
      setIndex(indexOfStage);
      const safeIndex = indexOfStage >= 0 ? indexOfStage : 0;
      setArrowPosition(64 + safeIndex * lineWidth + 20 * safeIndex);
    }, 500);
  }, [lineWidth]);
  const trackEvent = (event, source) => {
    mixpanel.track(event, {source: source})
  }
  const adjustMargin = () => {
    const bookCallSection = document.getElementById("book_call");
    const scaleContainer = document.getElementById("scale_container");
    if (!scaleContainer) return;
    const scaleContainerWidth = scaleContainer.offsetWidth;
    const w = (scaleContainerWidth - 200) / 3;
    setLineWidth(w);
    if (index >= 0) {
      setArrowPosition(64 + index * w + 20 * index);
    }
    if (bookCallSection) {
      const windowHeight = window.innerHeight;
      const sectionHeight = bookCallSection.offsetHeight;
      const marginBottom = windowHeight - sectionHeight - 64;
      bookCallSection.style.marginBottom = `${marginBottom}px`;
    }
  };
  useEffect(() => {
    adjustMargin();
    window.addEventListener("resize", adjustMargin);
    return () => window.removeEventListener("resize", adjustMargin);
  }, []);
  const phaseName = scoreJson?.transitionStage?.stage;
  const phaseSlug = phaseName ? String(phaseName).toLowerCase() : null;
  const firstName = localStorage.getItem('userName') ?? '';
  const transitionTypeValue = localStorage.getItem('transitionType');
  const dontKnowValue = intl.formatMessage({ id: 'transition_type_dont_know_value', defaultMessage: '6' });
  const useDescriptionWithTransitionType = transitionTypeValue != null && transitionTypeValue !== '' && transitionTypeValue !== dontKnowValue;
  const transitionTypeLabel = useDescriptionWithTransitionType && transitionTypeValue != null
    ? intl.formatMessage({ id: `transition_type_${transitionTypeValue}`, defaultMessage: transitionTypeValue })
    : '';
  const phaseDescKey = phaseSlug
    ? `transition_phase_${phaseSlug}_description${useDescriptionWithTransitionType ? '' : '_no_type'}`
    : null;
  const rawDescriptionStage = phaseDescKey
    ? intl.formatMessage(
        { id: phaseDescKey, defaultMessage: scoreJson?.transitionStage?.description ?? '' },
        useDescriptionWithTransitionType
          ? { FirstName: firstName, TransitionType: transitionTypeLabel }
          : { FirstName: firstName }
      )
    : (scoreJson?.transitionStage?.description ?? '');
  const rawDescriptionScore = scoreJson?.transitionScore?.description ?? '';
  const htmlDescriptionStage = String(rawDescriptionStage).replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  const htmlDescriptionScore = String(rawDescriptionScore).replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  let stageMoreLink;
  if(index === 1){
    stageMoreLink = intl.formatMessage({ id: 'perimenopause_link' })
  } else if(index === 2){
    stageMoreLink = intl.formatMessage({ id: 'menopause_link' })
  } else if(index === 3){
    stageMoreLink = intl.formatMessage({ id: 'postmenopause_link' })
  }
  const segmentMs = index >= 0 ? Math.round(((index + 1) * 500 + 250) / (index + 1)) : 250;

  return (
    <div className="results">
      <div className="topic-header">
        <a href={brand.logo.link}>
          <img src={brand.logo.src} alt={brand.logo.alt} className="logo" />
        </a>
      </div>
      <div className="transition-score-container">
        {
          index > -1 && (
            <div className="transition-stage-scale-mobile">
              <svg width="33" height="32" viewBox="0 0 33 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0.5" width="32" height="32" rx="16" fill="#D8DBE4"/>
                <circle cx="16.5" cy="16" r="8" fill="white"/>
              </svg>
              <div className="bubble">
                {stages[index]}
              </div>

            </div>
          )
        }
        <div className="transition-stage-scale">
          <div className="transition-stage-scale-container" id="scale_container">
            <div className={`arrow ${index === -1 ? 'd-none' : ''}`}
                 style={{left: arrowPosition, transitionDuration: `${(index + 1) * 500 + 250}ms`}}>
              <svg width="7" height="8" viewBox="0 0 7 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.5 3.13364C7.16667 3.51854 7.16667 4.48079 6.5 4.86569L1.5 7.75244C0.833332 8.13734 9.86826e-08 7.65621 8.95028e-08 6.88641L2.06545e-08 1.11291C1.14747e-08 0.343109 0.833333 -0.138015 1.5 0.246885L6.5 3.13364Z"
                  fill="#3D497A"/>
              </svg>
            </div>
            <div className="line-small">
              <span className={index >= 0 ? 'active' : ''} style={{transitionDuration: `${segmentMs}ms`}}></span>
            </div>
            <div className={`item item1 ${index >= 0 ? 'active' : ''}`} style={{left: '64px', textIndent: -(stage0Width)}}>
              <span id="stage0">{stages[0]}</span>
            </div>
            <div className="line-big" style={{left: '20px', width: `${lineWidth}px`}}>
              <span className={index > 0 ? 'active' : ''} style={{transitionDelay: `${segmentMs}ms`, transitionDuration: `${segmentMs}ms`}}></span>
            </div>
            <div className={`item item2 ${index > 0 ? 'active' : ''}`}  style={{left: `${lineWidth + 84}px`, textIndent: -(stage1Width)}}>
              <span id="stage1">{stages[1]}</span>
            </div>
            <div className="line-big" style={{left: `40px`, width: `${lineWidth}px`}}>
              <span className={index > 1 ? 'active' : ''} style={{transitionDelay: `${2 * segmentMs}ms`, transitionDuration: `${segmentMs}ms`}}></span>
            </div>
            <div className={`item item3 ${index > 1 ? 'active' : ''}`}  style={{left: `${lineWidth*2 + 104}px`, textIndent: -(stage2Width)}}>
              <span id="stage2">{stages[2]}</span>
            </div>
            <div className="line-big" style={{left: `60px`, width: `${lineWidth}px`}}>
              <span className={index > 2 ? 'active' : ''} style={{transitionDelay: `${3 * segmentMs}ms`, transitionDuration: `${segmentMs}ms`}}></span>
            </div>
            <div className={`item item4 ${index > 2 ? 'active' : ''}`}  style={{left: `${lineWidth*3 + 124}px`, textIndent: -(stage3Width)}}>
              <span id="stage3">{stages[3]}</span>
            </div>
            <div className="top-arrow">
              <svg width="60" height="12" viewBox="0 0 60 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="60" y="4" width="4" height="60" rx="2" transform="rotate(90 60 4)" fill="#D8DBE4"/>
                <path fillRule="evenodd" clipRule="evenodd"
                      d="M60 6C60 6.62915 59.7782 7.22768 59.3915 7.64198L55.8277 11.4601C55.0871 12.2536 53.9613 12.1617 53.3133 11.2549C52.6668 10.3502 52.7399 8.97617 53.4757 8.18181L37.7819 8.18181C36.7978 8.18181 36 7.20498 36 6C36 4.79502 36.7978 3.81819 37.7819 3.81819L53.4757 3.81819C52.7399 3.02383 52.6668 1.64981 53.3133 0.745107C53.9613 -0.161732 55.0871 -0.253625 55.8277 0.53986L59.3915 4.35802C59.7782 4.77232 60 5.37085 60 6Z"
                      fill="#D8DBE4"/>
              </svg>

            </div>
          </div>

        </div>
        <div className="transition-stage" id={scoreJson?.transitionStage?.stagetitle ?? 'transition-phase'}>
          <div className="transition-stage-main-content">
            <div className="transition-stage-text">
              <div className="transition-stage-prehead">
                {scoreSummary.stageTitle}
              </div>
              <div className="transition-stage-title">
                {scoreJson?.transitionStage?.stageDisplayName ?? scoreJson?.transitionStage?.stage ?? '—'}
              </div>
              <div className="transition-stage-description"
                   dangerouslySetInnerHTML={{__html: htmlDescriptionStage}}/>
            </div>
          </div>
          <div className="transition-stage-explanation"
               dangerouslySetInnerHTML={{__html: intl.formatMessage({ id: "menopause_stage_determination" })}}
          />
        </div>
        {index > -1 && (
          <div className="transition-score" id={scoreJson?.transitionScore?.scoretitle ?? 'transition-score'}>
            <div className="transition-stage-main-content">
              <div className="transition-stage-text">
                <div className="transition-stage-prehead">
                  {scoreSummary.scoreTitle}
                </div>
                <div className="transition-stage-title">
                  {scoreJson?.transitionScore?.scorename ?? ''}
                </div>
                <div className="transition-stage-description"
                     dangerouslySetInnerHTML={{__html: htmlDescriptionScore}}/>
              </div>
            </div>
            {
              index > -1 && (
                <div className="transition-stage-stats">
                  <div className="percent">
                    {index === 0 && intl.formatMessage({ id: 'premenopause_percentage' })}
                    {index === 1 && intl.formatMessage({ id: 'perimenopause_percentage' })}
                    {index === 2 && intl.formatMessage({ id: 'menopause_percentage' })}
                    {index === 3 && intl.formatMessage({ id: 'postmenopause_percentage' })}
                  </div>
                  <div className="text">
                    {index === 0 && intl.formatMessage({ id: 'premenopause_insights' })}
                    {index === 1 && intl.formatMessage({ id: 'perimenopause_insights' })}
                    {index === 2 && intl.formatMessage({ id: 'menopause_insights' })}
                    {index === 3 && intl.formatMessage({ id: 'postmenopauseinsights' })}
                  </div>
                </div>
              )
            }
            <div className="transition-stage-action-buttons transition-score-action-buttons">
              <a
                href={intl.formatMessage({ id: "become_member_link" })}
                target="_blank"
                className="button whatsapp"
                onClick={() => trackEvent(`Dashboard-Score Click on ${intl.formatMessage({ id: 'become_member' })} button`, 'Transition score section')}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g clipPath="url(#clip0_1678_1939)">
                    <path fillRule="evenodd" clipRule="evenodd"
                          d="M17.0859 2.90417C15.2061 1.03232 12.7059 0.000949696 10.042 0C4.55283 0 0.08547 4.44221 0.08356 9.90249C0.082605 11.648 0.54147 13.3518 1.41288 14.8533L0 19.9854L5.27909 18.6083C6.7335 19.3976 8.37128 19.813 10.0377 19.8135H10.042C15.5302 19.8135 19.9981 15.3708 20 9.91055C20.0009 7.26425 18.9662 4.7765 17.0859 2.90465V2.90417ZM10.042 18.1411H10.0387C8.55367 18.1407 7.09689 17.7436 5.82583 16.9939L5.52357 16.8154L2.39078 17.6325L3.22686 14.5949L3.03013 14.2834C2.20169 12.9729 1.76383 11.4581 1.76479 9.90298C1.7667 5.36484 5.47963 1.67241 10.0454 1.67241C12.2561 1.67336 14.3342 2.53047 15.8969 4.08655C17.4598 5.64216 18.3197 7.71061 18.3188 9.90961C18.3168 14.4482 14.6039 18.1407 10.042 18.1407V18.1411ZM14.5819 11.9766C14.3332 11.8527 13.1099 11.2544 12.8816 11.1718C12.6534 11.0891 12.4877 11.0478 12.322 11.2957C12.1563 11.5436 11.6793 12.1011 11.5342 12.2658C11.389 12.4311 11.2438 12.4515 10.9951 12.3275C10.7463 12.2036 9.94461 11.9424 8.99395 11.0996C8.25433 10.4433 7.75483 9.63326 7.60972 9.38536C7.46456 9.13751 7.59444 9.00359 7.71856 8.88061C7.83028 8.7695 7.96733 8.59144 8.09194 8.44707C8.21661 8.30271 8.25767 8.19923 8.34072 8.03442C8.42383 7.86917 8.38228 7.72486 8.32022 7.60088C8.25811 7.47696 7.76061 6.25895 7.55289 5.7637C7.35089 5.28127 7.14561 5.3468 6.99328 5.33872C6.84811 5.3316 6.68244 5.33018 6.51628 5.33018C6.35011 5.33018 6.08078 5.39191 5.85256 5.63978C5.62433 5.88762 4.98162 6.48641 4.98162 7.70392C4.98162 8.92144 5.87311 10.0986 5.99772 10.2639C6.12233 10.4291 7.75244 12.9282 10.2483 14.0004C10.8418 14.2554 11.3054 14.4078 11.6669 14.5218C12.2628 14.7103 12.8052 14.6838 13.234 14.6201C13.712 14.5489 14.7061 14.0213 14.9133 13.4434C15.1206 12.8655 15.1206 12.3698 15.0585 12.2667C14.9964 12.1637 14.8303 12.1015 14.5815 11.9776L14.5819 11.9766Z"
                          fill="white"/>
                  </g>
                  <defs>
                    <clipPath id="clip0_1678_1939">
                      <rect width="20" height="20" fill="white"/>
                    </clipPath>
                  </defs>
                </svg>
                <span>{intl.formatMessage({ id: 'become_member' })}</span>
              </a>
              <a
                href={intl.formatMessage({ id: "become_member_link" })}
                target="_blank"
                className="button button--secondary more-link"
                onClick={() => trackEvent(`Dashboard-Score Click on ${intl.formatMessage({ id: 'discover_membership_textlink' })} button`, 'Transition score section')}
              >
                <span>{intl.formatMessage({ id: 'discover_membership_textlink' })}</span>
                <svg width="16" height="16" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M4.66602 9.99996H16.3327M16.3327 9.99996L10.4993 4.16663M16.3327 9.99996L10.4993 15.8333"
                    stroke="#3D497A"
                    strokeWidth="1.66667"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
            <div className="transition-stage-explanation"
                 dangerouslySetInnerHTML={{__html: intl.formatMessage({ id: "score_explanation" })}}/>
          </div>
        )}
        {((scoreJson?.keySymptoms?.mostImpactful?.length ?? 0) > 0 || (scoreJson?.keySymptoms?.moderateImpact?.length ?? 0) > 0) && (
          <div className="simptoms-recommendations" id="symptoms">
            <div className="symptoms-prehead">
              {scoreJson?.keySymptoms?.symptomstitle ?? ''}
            </div>
            <div className="intro">
              <h2>{intl.formatMessage({ id: 'symptomsTitle' })}</h2>
              <div className="intro-text">{intl.formatMessage({ id: 'symptomsDescription' })}</div>
            </div>
            {((scoreJson?.keySymptoms?.mostImpactful?.length ?? 0) > 0 || (scoreJson?.keySymptoms?.moderateImpact?.length ?? 0) > 0) && (
              <div className="action-buttons">
                {(scoreJson?.keySymptoms?.mostImpactful?.length ?? 0) > 0 && (
                  <button
                    className={`button ${currentTab === 'high' ? 'button--primary' : 'button--secondary'}`}
                    onClick={() => {
                      trackEvent(`Dashboard Symptoms Click on ${intl.formatMessage({ id: 'high_impact' })} button`, 'Symptoms Section')
                      setCurrentTab('high')
                    }}
                  >
                    <span>{intl.formatMessage({ id: 'high_impact' })}</span>
                  </button>
                )}
                {(scoreJson?.keySymptoms?.moderateImpact?.length ?? 0) > 0 && (
                  <button
                    className={`button ${currentTab === 'moderate' ? 'button--primary' : 'button--secondary'}`}
                    onClick={() => {
                      trackEvent(`Dashboard Symptoms Click on ${intl.formatMessage({ id: 'low_impact' })} button`, 'Symptoms Section')
                      setCurrentTab('moderate')
                    }}
                  >
                    <span>{intl.formatMessage({ id: 'low_impact' })}</span>
                  </button>
                )}
              </div>
            )}
            {
              scoreJson?.keySymptoms?.mostImpactful?.map((s, index) => (
                <div
                  className={`symptom high symptom${index} ${s.isMentalHealth ? '' : ''} ${currentTab === 'high' ? '' : 'd-none'}`}
                  id="high_impact"
                  key={s.name}>
                  <div className="name">
                    {s.isMentalHealth && false ? (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M11.9998 9.00023V13.0002M11.9998 17.0002H12.0098M10.6151 3.89195L2.39019 18.0986C1.93398 18.8866 1.70588 19.2806 1.73959 19.6039C1.769 19.886 1.91677 20.1423 2.14613 20.309C2.40908 20.5002 2.86435 20.5002 3.77487 20.5002H20.2246C21.1352 20.5002 21.5904 20.5002 21.8534 20.309C22.0827 20.1423 22.2305 19.886 22.2599 19.6039C22.2936 19.2806 22.0655 18.8866 21.6093 18.0986L13.3844 3.89195C12.9299 3.10679 12.7026 2.71421 12.4061 2.58235C12.1474 2.46734 11.8521 2.46734 11.5935 2.58235C11.2969 2.71421 11.0696 3.10679 10.6151 3.89195Z"
                          stroke="#FF4589" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>

                    ) : (
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#3D497A" strokeWidth="2" strokeLinecap="round"
                              strokeLinejoin="round"/>
                      </svg>
                    )}
                    {intl.formatMessage({ id: `${s.dataPointName.replaceAll(' ', '')}_name` })}
                  </div>
                  <div className="description"
                       dangerouslySetInnerHTML={{__html: intl.formatMessage({ id: `${s.dataPointName?.replaceAll(" ", "")}_description` })}}/>
                  <div style={{display: "flex", gap: '16px', flexWrap: 'wrap'}}>
                    <a
                      href={intl.formatMessage({ id: 'become_member_link' })}
                      target="_blank"
                      className="button whatsapp"
                      onClick={() => trackEvent(`Dashboard Impactful Symptom Click on ${intl.formatMessage({ id: 'talk_to_doctor' })} button`, 'Impactful Symptom')}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_1678_1939)">
                          <path fillRule="evenodd" clipRule="evenodd"
                                d="M17.0859 2.90417C15.2061 1.03232 12.7059 0.000949696 10.042 0C4.55283 0 0.08547 4.44221 0.08356 9.90249C0.082605 11.648 0.54147 13.3518 1.41288 14.8533L0 19.9854L5.27909 18.6083C6.7335 19.3976 8.37128 19.813 10.0377 19.8135H10.042C15.5302 19.8135 19.9981 15.3708 20 9.91055C20.0009 7.26425 18.9662 4.7765 17.0859 2.90465V2.90417ZM10.042 18.1411H10.0387C8.55367 18.1407 7.09689 17.7436 5.82583 16.9939L5.52357 16.8154L2.39078 17.6325L3.22686 14.5949L3.03013 14.2834C2.20169 12.9729 1.76383 11.4581 1.76479 9.90298C1.7667 5.36484 5.47963 1.67241 10.0454 1.67241C12.2561 1.67336 14.3342 2.53047 15.8969 4.08655C17.4598 5.64216 18.3197 7.71061 18.3188 9.90961C18.3168 14.4482 14.6039 18.1407 10.042 18.1407V18.1411ZM14.5819 11.9766C14.3332 11.8527 13.1099 11.2544 12.8816 11.1718C12.6534 11.0891 12.4877 11.0478 12.322 11.2957C12.1563 11.5436 11.6793 12.1011 11.5342 12.2658C11.389 12.4311 11.2438 12.4515 10.9951 12.3275C10.7463 12.2036 9.94461 11.9424 8.99395 11.0996C8.25433 10.4433 7.75483 9.63326 7.60972 9.38536C7.46456 9.13751 7.59444 9.00359 7.71856 8.88061C7.83028 8.7695 7.96733 8.59144 8.09194 8.44707C8.21661 8.30271 8.25767 8.19923 8.34072 8.03442C8.42383 7.86917 8.38228 7.72486 8.32022 7.60088C8.25811 7.47696 7.76061 6.25895 7.55289 5.7637C7.35089 5.28127 7.14561 5.3468 6.99328 5.33872C6.84811 5.3316 6.68244 5.33018 6.51628 5.33018C6.35011 5.33018 6.08078 5.39191 5.85256 5.63978C5.62433 5.88762 4.98162 6.48641 4.98162 7.70392C4.98162 8.92144 5.87311 10.0986 5.99772 10.2639C6.12233 10.4291 7.75244 12.9282 10.2483 14.0004C10.8418 14.2554 11.3054 14.4078 11.6669 14.5218C12.2628 14.7103 12.8052 14.6838 13.234 14.6201C13.712 14.5489 14.7061 14.0213 14.9133 13.4434C15.1206 12.8655 15.1206 12.3698 15.0585 12.2667C14.9964 12.1637 14.8303 12.1015 14.5815 11.9776L14.5819 11.9766Z"
                                fill="white"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_1678_1939">
                            <rect width="20" height="20" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>
                      <span>{intl.formatMessage({ id: 'talk_to_doctor' })}</span>
                    </a>
                    <a
                      href={intl.formatMessage({ id: `${s.dataPointName?.replaceAll(" ", "")}_link` })}
                      target="_blank"
                      className="button button--secondary"
                      onClick={() => trackEvent(`Dashboard Impactful Symptom Click on ${intl.formatMessage({ id: 'symptom_link_text' })} button`, 'Impactful Symptom')}
                    >
                      <span>{intl.formatMessage({ id: 'symptom_link_text' })}</span>
                      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M4.66602 9.99996H16.3327M16.3327 9.99996L10.4993 4.16663M16.3327 9.99996L10.4993 15.8333"
                          stroke="#3D497A"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>

                </div>
              ))
            }
            {
              scoreJson?.keySymptoms?.moderateImpact?.map(s => (
                <div className={`symptom symptom0 moderate ${currentTab === 'moderate' ? '' : 'd-none'}`} id="low_impact"
                     key={s.name}>
                  <div className="name">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#3D497A" strokeWidth="2" strokeLinecap="round"
                            strokeLinejoin="round"/>
                    </svg>
                    {intl.formatMessage({ id: `${s.dataPointName.replaceAll(' ', '')}_name` })}
                  </div>
                  <div className="description"
                       dangerouslySetInnerHTML={{__html: intl.formatMessage({ id: `${s.dataPointName?.replaceAll(" ", "")}_description` })}}/>
                  <div style={{display: "flex", gap: '16px', flexWrap: 'wrap', alignItems: 'center'}}>
                    <a
                      href={intl.formatMessage({ id: 'become_member_link' })}
                      target="_blank"
                      className="button whatapp"
                      onClick={() => trackEvent(`Dashboard Moderate Symptom Click on ${intl.formatMessage({ id: 'talk_to_doctor' })} button`, 'Moderate Symptom')}
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_1678_1939)">
                          <path fillRule="evenodd" clipRule="evenodd"
                                d="M17.0859 2.90417C15.2061 1.03232 12.7059 0.000949696 10.042 0C4.55283 0 0.08547 4.44221 0.08356 9.90249C0.082605 11.648 0.54147 13.3518 1.41288 14.8533L0 19.9854L5.27909 18.6083C6.7335 19.3976 8.37128 19.813 10.0377 19.8135H10.042C15.5302 19.8135 19.9981 15.3708 20 9.91055C20.0009 7.26425 18.9662 4.7765 17.0859 2.90465V2.90417ZM10.042 18.1411H10.0387C8.55367 18.1407 7.09689 17.7436 5.82583 16.9939L5.52357 16.8154L2.39078 17.6325L3.22686 14.5949L3.03013 14.2834C2.20169 12.9729 1.76383 11.4581 1.76479 9.90298C1.7667 5.36484 5.47963 1.67241 10.0454 1.67241C12.2561 1.67336 14.3342 2.53047 15.8969 4.08655C17.4598 5.64216 18.3197 7.71061 18.3188 9.90961C18.3168 14.4482 14.6039 18.1407 10.042 18.1407V18.1411ZM14.5819 11.9766C14.3332 11.8527 13.1099 11.2544 12.8816 11.1718C12.6534 11.0891 12.4877 11.0478 12.322 11.2957C12.1563 11.5436 11.6793 12.1011 11.5342 12.2658C11.389 12.4311 11.2438 12.4515 10.9951 12.3275C10.7463 12.2036 9.94461 11.9424 8.99395 11.0996C8.25433 10.4433 7.75483 9.63326 7.60972 9.38536C7.46456 9.13751 7.59444 9.00359 7.71856 8.88061C7.83028 8.7695 7.96733 8.59144 8.09194 8.44707C8.21661 8.30271 8.25767 8.19923 8.34072 8.03442C8.42383 7.86917 8.38228 7.72486 8.32022 7.60088C8.25811 7.47696 7.76061 6.25895 7.55289 5.7637C7.35089 5.28127 7.14561 5.3468 6.99328 5.33872C6.84811 5.3316 6.68244 5.33018 6.51628 5.33018C6.35011 5.33018 6.08078 5.39191 5.85256 5.63978C5.62433 5.88762 4.98162 6.48641 4.98162 7.70392C4.98162 8.92144 5.87311 10.0986 5.99772 10.2639C6.12233 10.4291 7.75244 12.9282 10.2483 14.0004C10.8418 14.2554 11.3054 14.4078 11.6669 14.5218C12.2628 14.7103 12.8052 14.6838 13.234 14.6201C13.712 14.5489 14.7061 14.0213 14.9133 13.4434C15.1206 12.8655 15.1206 12.3698 15.0585 12.2667C14.9964 12.1637 14.8303 12.1015 14.5815 11.9776L14.5819 11.9766Z"
                                fill="white"/>
                        </g>
                        <defs>
                          <clipPath id="clip0_1678_1939">
                            <rect width="20" height="20" fill="white"/>
                          </clipPath>
                        </defs>
                      </svg>

                      <span>{intl.formatMessage({ id: 'talk_to_doctor' })}</span>
                    </a>
                    <a
                      href={intl.formatMessage({ id: `${s.dataPointName?.replaceAll(" ", "")}_link` })}
                      target="_blank"
                      className="button button--secondary"
                      onClick={() => trackEvent(`Dashboard Moderate Symptom Click on ${intl.formatMessage({ id: 'symptom_link_text' })} button`, 'Moderate Symptom')}
                    >
                      <span>{intl.formatMessage({ id: 'symptom_link_text' })}</span>
                      <svg width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M4.66602 9.99996H16.3327M16.3327 9.99996L10.4993 4.16663M16.3327 9.99996L10.4993 15.8333"
                          stroke="#3D497A"
                          strokeWidth="1.66667"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              ))
            }
          </div>
        )}
        <div className="box" id="whats_next">
          <div className="content">
            <div className="title"
                 dangerouslySetInnerHTML={{__html: intl.formatMessage({ id: "membership_title" })}}/>
            <div className="description"
                 dangerouslySetInnerHTML={{__html: intl.formatMessage({ id: "membership_bullets" })}}/>
            <div className="actions">
              <a
                href={intl.formatMessage({ id: 'membership_ctalink' })}
                target="_blank"
                className="button button--secondary"
                onClick={() => trackEvent(`Dashboard What's Next Click on ${intl.formatMessage({ id: 'membership_cta' })} button`, 'Next steps section')}
              >
                <span>{intl.formatMessage({ id: 'membership_cta' })}</span>
              </a>
            </div>
          </div>
          <div className="info-box">
            <div className="stats">{intl.formatMessage({ id: 'membership_percentage' })}</div>
            <div className="stats-desc">{intl.formatMessage({ id: 'membership_insights' })}</div>
          </div>
        </div>
        <div className="box" id="book_call">
          <div className="content">
            <div className="title"
                 dangerouslySetInnerHTML={{__html: intl.formatMessage({ id: "book_call_content_title" })}}/>
            <div className="description"
                 dangerouslySetInnerHTML={{__html: intl.formatMessage({ id: "book_call_content_description" })}}/>
            <div className="actions">
              <a
                href="https://evrbloom.ro/pages/dr-virginia-lazar"
                target="_blank"
                className="button button--primary"
                onClick={() => trackEvent(`Dashboard Book a call Click on ${intl.formatMessage({ id: 'book_call' })} button`, 'Book a call section')}
              >
                <span>{intl.formatMessage({ id: 'book_call' })}</span>
              </a>
            </div>
          </div>
          <div className="info-box-dr">
            <img src={virginiaImage}/>
            <div className="dr-info">
              <div className="dr-name">Dr. Virginia Lazar</div>
              <div className="dr-desc">{intl.formatMessage({ id: 'book_call_dr_info' })}</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}