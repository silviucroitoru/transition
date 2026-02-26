import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import mixpanel from "mixpanel-browser";
import Page from "./components/Page.jsx";
import './Questionaire.css'
import HeaderArea from "./components/HeaderArea.jsx";
import { fetchQuestionnaireByLanguage, saveSubmission, saveTransitionResult } from '../data/questionnaireApi';
import { computeTransitionResult } from '../data/scoringEngine';
import scoringMap from '../data/TransitionScoringMap.json';

export default function Questionaire() {
  function getLanguageFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('language');
  }
  const [questionnaire, setQuestionnaire] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [language] = useState(getLanguageFromURL() ?? 'EN');
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [submissionId, setSubmissionId] = useState();
  const [responses, setResponses] = useState({});
  const responsesRef = useRef({});
  const [progressPages, setProgressPages] = useState([1]);
  const [currentPage, setCurrentPage] = useState(null);
  const [previousPagePos, setPreviousPagePos] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const topicPageRef = useRef(null);
  const headerRef = useRef(null);
  const originalHeight = useRef(0);
  const [extraHeight, setExtraHeight] = useState(window.innerWidth < 990 ? 56 : 64);
  useEffect(() => {
    mixpanel.track('[Page View] Questionnaire', {source: 'Questionnaire'})
    const handleResize = () => {
      setExtraHeight(window.innerWidth < 990 ? 56 : 64);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent Safari mobile from showing a "pre-selected" option on the next screen
  // (same index as the one just tapped) by clearing focus when the page changes.
  useEffect(() => {
    if (currentPage?.position == null) return;
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (document.activeElement && document.activeElement !== document.body) {
          document.activeElement.blur();
        }
      });
    });
    return () => cancelAnimationFrame(t);
  }, [currentPage?.position]);

  const navigate = useNavigate();

  useEffect(() => {
    const fromUrl = getLanguageFromURL();
    const toSet = fromUrl?.toLowerCase() ?? 'en';
    localStorage.setItem("language", toSet);
    if (topicPageRef.current) {
      originalHeight.current = topicPageRef.current.clientHeight;
    }
    async function loadQuestionnaire() {
      setLoadError(null);
      try {
        const content = await fetchQuestionnaireByLanguage(language);
        const raw = content.info || [];
        const normalized = raw.map((p) => ({ ...p, position: Number(p.position) }));
        const sorted = {
          ...content,
          info: normalized.sort((a, b) => a.position - b.position),
        };
        setQuestionnaire(sorted);
        setCurrentPage(sorted.info[0]);
      } catch (error) {
        console.error('Failed to load questionnaire:', error);
        setLoadError(error);
      }
    }

    loadQuestionnaire();
    // eslint-disable-next-line
  }, []);
  const next = async (pageNo, dataPointId, dataPointName, a, type) => {
    if (type === "first_name") {
      setUserName(a)
      localStorage.setItem('userName', a)
    }
    if (type === "email") {
      localStorage.setItem('bloomEmail', a)
    }
    if (type !== "intro" && type !== "media" && type !== "email") {
      const nextResponses = { ...responsesRef.current, [dataPointName]: a };
      responsesRef.current = nextResponses;
      setResponses(nextResponses);
    }
    if (type !== "email") {
      const nextPageNo = Number(pageNo);
      const nextPage = questionnaire.info?.find((page) => page.position === nextPageNo);
      if (nextPage) {
        setPreviousPagePos(currentPage?.position ?? null);
        setIsTransitioning(true);
        setProgressPages([...progressPages, nextPageNo]);
        setCurrentPage(nextPage);
        setTimeout(() => {
          setPreviousPagePos(null);
          setIsTransitioning(false);
        }, 250);
      }
    }
    mixpanel.track(`[Page ${pageNo} View] Questionnaire`, { source: 'Questionnaire' });
    if (type === "email") {
      setSaveError(null);
      const allResponses = { ...responsesRef.current, [dataPointName]: a };
      const scoreResult = computeTransitionResult(allResponses, scoringMap);
      try {
        localStorage.setItem('transitionScoreResult', JSON.stringify(scoreResult));
      } catch (e) {
        console.warn('Could not store score result in localStorage', e);
      }
      if (allResponses.TransitionType != null) {
        try {
          localStorage.setItem('transitionType', allResponses.TransitionType);
        } catch (e) {
          console.warn('Could not store TransitionType in localStorage', e);
        }
      }
      try {
        const newSubmissionId = await saveSubmission({
          language,
          responses: allResponses,
          email: a,
        });
        setSubmissionId(newSubmissionId);
        localStorage.setItem('SubmissionID', newSubmissionId);
        try {
          await saveTransitionResult(newSubmissionId, scoreResult);
        } catch (err) {
          console.warn('Failed to persist transition result; using localStorage only', err);
        }
        navigate('/dashboard');
      } catch (error) {
        console.error('Failed to save submission to Supabase', error);
        setSaveError(error);
      }
    }
  }

  const back = () => {
    const prevPosition = Number(progressPages[progressPages.length - 2]);
    setPreviousPagePos(currentPage?.position ?? null);
    setIsTransitioning(true);
    setCurrentPage(questionnaire.info.find(page => page.position === prevPosition));
    setProgressPages(prevItems => prevItems.slice(0, -1));
    mixpanel.track(`[Page ${prevPosition} View] Questionnaire`, {source: 'Questionnaire'})
    setTimeout(() => {
      setPreviousPagePos(null);
      setIsTransitioning(false);
    }, 250);
  }
  if (loadError) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', maxWidth: '28rem', margin: '0 auto' }}>
        <p style={{ marginBottom: '1rem' }}>Unable to load the questionnaire. Please check your connection and try again.</p>
        <button
          type="button"
          className="button button--primary"
          onClick={() => {
            setLoadError(null);
            setQuestionnaire(null);
            fetchQuestionnaireByLanguage(language)
              .then((content) => {
                const raw = content.info || [];
                const normalized = raw.map((p) => ({ ...p, position: Number(p.position) }));
                const sorted = { ...content, info: normalized.sort((a, b) => a.position - b.position) };
                setQuestionnaire(sorted);
                setCurrentPage(sorted.info[0]);
              })
              .catch((err) => {
                console.error('Failed to load questionnaire:', err);
                setLoadError(err);
              });
          }}
        >
          Try again
        </button>
      </div>
    );
  }
  if (!questionnaire) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        Loading questionnaire…
      </div>
    );
  }
  if (!currentPage) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        No question to display. Check questionnaire data.
      </div>
    );
  }
  const dynamicHeight = currentPage.position === 1 ? "100dvh" : `calc(100dvh + ${extraHeight}px)`;

  return (
    <div className={`${currentPage.position === 1 ? 'active' : ''} no-scroll`} style={{ height: dynamicHeight }}>
      <div className="topic-header" ref={headerRef}>
        <HeaderArea
          currentPage={currentPage}
          progressPages={progressPages}
          qLength={questionnaire.info.length}
        />
      </div>
      {saveError && currentPage?.QuestionType === 'email' && (
        <div style={{ padding: '0.75rem 1rem', margin: '0 1rem', background: '#fee', color: '#c00', borderRadius: 8 }}>
          <p style={{ margin: 0 }}>Your answers could not be saved. Please check your connection and try again.</p>
          {saveError?.message && <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{saveError.message}</p>}
          <button type="button" className="button button--primary" style={{ marginTop: '0.5rem' }} onClick={() => setSaveError(null)}>Dismiss</button>
        </div>
      )}
      <div className="page-narrow" id="topic-page-container" ref={topicPageRef}>
        <div className="page-container">
          {
            questionnaire?.info.map((page) => {
              const isCurrent = currentPage.position === page.position;
              const isPrevious = previousPagePos === page.position;
              const pageClass = isCurrent ? 'active' : isPrevious ? 'inactive' : '';
              return (
                <div key={page.position}
                     className={`page page-width ${pageClass}`.trim()}
                     style={isTransitioning && isCurrent ? { pointerEvents: 'none' } : undefined}
                     id={`page${page.position}`}>
                  <Page
                    page={page}
                    next={next}
                    back={back}
                    currentPage={currentPage}
                    userName={userName}
                    isActive
                    language={language}
                  />
                </div>

              );
            })
          }
        </div>
      </div>
    </div>

  );
}