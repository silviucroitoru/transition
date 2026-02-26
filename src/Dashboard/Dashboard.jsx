import SideBar from "../components/SideBar.jsx";
import mixpanel from "mixpanel-browser";
import TransitionScore from "../LeadQuestionAnswer/TransitionScore.jsx";
import Loader from "../LeadQuestionAnswer/Loader.jsx";
import './dashboard.css'
import { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import scoringMap from "../data/TransitionScoringMap.json";
import { getTransitionResult } from "../data/questionnaireApi";

const defaultScoreJson = {
  transitionScore: {
    scoretitle: "Current State",
    scorename: "Your experience",
    score: 0,
    description: "Complete the questionnaire to see your results.",
    scoreExplanation: ""
  },
  transitionStage: {
    stagetitle: "Transition Phase",
    stage: "—",
    stages: scoringMap.PhaseOrder || ["Awareness", "Stabilization", "Rebuild", "Integration"],
    description: "Your phase will be shown here based on your answers.",
    stageDeterminationExplanation: ""
  },
  keySymptoms: {
    symptomstitle: "The Shift",
    mostImpactful: [],
    moderateImpact: []
  }
};

function buildScoreJsonFromResult(scoreResult, intl) {
  const phaseOrder = scoringMap.PhaseOrder || [];
  const score = scoreResult.experienceState === "Challenging"
    ? Math.max(0, 50 - (scoreResult.strainScore || 0) * 5)
    : Math.min(100, 50 + (scoreResult.strainScore || 0) * 5);
  return {
    transitionScore: {
      scoretitle: "Current State",
      scorename: scoreResult.experienceState,
      score,
      description: scoreResult.experienceState === "Challenging"
        ? "Your responses suggest this transition period feels challenging. Support and structure can help."
        : "Your responses suggest you are navigating this transition with a sense of support.",
      scoreExplanation: ""
    },
    transitionStage: {
      stagetitle: "Transition Phase",
      stage: scoreResult.phase,
      stageDisplayName: scoreResult.phase,
      stages: phaseOrder,
      description: `You are in the ${scoreResult.phase} phase of transition.`,
      stageDeterminationExplanation: ""
    },
    keySymptoms: {
      symptomstitle: "The Shift",
      mostImpactful: [],
      moderateImpact: []
    }
  };
}

export default function Dashboard() {
  const intl = useIntl();
  const [scoreJson, setScoreJson] = useState(null);
  const [display, setDisplay] = useState(false);
  const [scoreSummary, setScoreSummary] = useState({});
  const language = localStorage.getItem('language');
  useEffect(() => {
    mixpanel.identify(localStorage.getItem('SubmissionID'));
    mixpanel.people.set({
      '$name': localStorage.getItem('userName'),
      '$email': localStorage.getItem('bloomEmail'),
    });
    setTimeout(() => { setDisplay(true); }, 13600);
    let fullJson = defaultScoreJson;
    try {
      const stored = localStorage.getItem('transitionScoreResult');
      if (stored) {
        const scoreResult = JSON.parse(stored);
        fullJson = buildScoreJsonFromResult(scoreResult, intl);
      }
    } catch (e) {
      console.warn('Could not read transition score result', e);
    }
    setScoreSummary({
      scoreTitle: fullJson.transitionScore?.scoretitle || null,
      stageTitle: fullJson.transitionStage?.stagetitle || null,
      symptomsTitle: (fullJson.keySymptoms?.moderateImpact?.length > 0 || fullJson.keySymptoms?.mostImpactful?.length > 0) ? fullJson.keySymptoms.symptomstitle : null,
      recommendationsTitle: (fullJson.anxietyRecommendation || fullJson.depressionRecommendation) ? "Recommendations" : null
    });
    setScoreJson(fullJson);
    // Also try fetching from DB (non-blocking; updates if found)
    (async () => {
      try {
        const submissionId = localStorage.getItem('SubmissionID');
        if (submissionId) {
          const dbResult = await getTransitionResult(submissionId);
          if (dbResult) {
            const dbJson = buildScoreJsonFromResult(dbResult, intl);
            setScoreSummary({
              scoreTitle: dbJson.transitionScore?.scoretitle || null,
              stageTitle: dbJson.transitionStage?.stagetitle || null,
              symptomsTitle: (dbJson.keySymptoms?.moderateImpact?.length > 0 || dbJson.keySymptoms?.mostImpactful?.length > 0) ? dbJson.keySymptoms.symptomstitle : null,
              recommendationsTitle: null
            });
            setScoreJson(dbJson);
          }
        }
      } catch (e) {
        console.warn('Could not fetch transition result from DB', e);
      }

    })();
    // eslint-disable-next-line
  }, []);
  return (
    <div className="dashboard">
      {scoreJson && display ? (
        <>
          <SideBar scoreSummary={scoreSummary} />
          <div className="pageContent">
            <TransitionScore scoreJson={scoreJson} scoreSummary={scoreSummary} />
          </div>
        </>
      ) : (
        <Loader />
      )}

    </div>
  );
}