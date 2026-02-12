import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockData } from './mockData';
import mixpanel from "mixpanel-browser";
import Page from "./components/Page.jsx";
import './Questionaire.css'
import HeaderArea from "./components/HeaderArea.jsx";
import { fetchQuestionnaireByLanguage, saveSubmission } from '../data/questionnaireApi';
export default function Questionaire() {
  function getLanguageFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('language');
  }
  const [questionnaire, setQuestionnaire] = useState(null);
  const [language] = useState(getLanguageFromURL() ?? 'RO');
  const [userName, setUserName] = useState(localStorage.getItem('userName'));
  const [submissionId, setSubmissionId] = useState();
  const [responses, setResponses] = useState({});
  const [progressPages, setProgressPages] = useState([1]);
  const [currentPage, setCurrentPage] = useState(null);
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
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("language", getLanguageFromURL()?.toLowerCase() ?? 'ro');
    if (topicPageRef.current) {
      originalHeight.current = topicPageRef.current.clientHeight;
    }
    async function loadQuestionnaire() {
      try {
        // Prefer Supabase; fall back to bundled mockData if it fails.
        const content = await fetchQuestionnaireByLanguage(language);
        setQuestionnaire(content);
        setCurrentPage(content.info[0]);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Falling back to local mockData.questionnaire due to error:', error);
        setSubmissionId(mockData.SubmissionID);
        setQuestionnaire(mockData.questionnaire);
        setCurrentPage(mockData.questionnaire.info[0]);
        localStorage.setItem('SubmissionID', mockData.SubmissionID);
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
      setResponses(prev => ({
        ...prev,
        [dataPointName]: a,
      }));
    }
    if(type !== "email"){
      setProgressPages([...progressPages, pageNo])
      setCurrentPage(questionnaire.info?.find((page) => page.position === pageNo));
    }
    mixpanel.track(`[Page ${pageNo} View] Questionnaire`, {source: 'Questionnaire'})
    if (type === "email") {
      const updatedResponses = {
        ...responses,
        [dataPointName]: a,
      };

      try {
        const newSubmissionId = await saveSubmission({
          language,
          responses: updatedResponses,
          email: a,
        });
        setSubmissionId(newSubmissionId);
        localStorage.setItem('SubmissionID', newSubmissionId);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to save submission to Supabase', error);
      }

      navigate('/dashboard');
    }
  }

  const back = () => {
    const pageNo = questionnaire.info.find(page => page.position === progressPages[progressPages.length - 2]);
    setCurrentPage(questionnaire.info.find(page => page.position === progressPages[progressPages.length - 2]));
    setProgressPages(prevItems => prevItems.slice(0, -1));
    mixpanel.track(`[Page ${pageNo} View] Questionnaire`, {source: 'Questionnaire'})
  }
  if( !questionnaire){
    return (<h1></h1>)
  }
  const dynamicHeight = currentPage.position === 1 ? "100dvh" : `calc(100dvh + ${extraHeight}px)`;

  return (
    <div className={`${currentPage.position === 1 ? 'active' : ''} no-scroll`} style={{height: dynamicHeight}}>
      <div className="topic-header" ref={headerRef}>
        <HeaderArea
          currentPage={currentPage}
          progressPages={progressPages}
          qLength={questionnaire.info.length}
        />
      </div>
      <div className="page-narrow" id="topic-page-container" ref={topicPageRef}>
        <div className="page-container">
          {
            questionnaire?.info.map((page) => {
              return (
                <div key={page.position} className={`page page-width ${currentPage.position === page.position ? 'active' : 'd-none'}`}
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