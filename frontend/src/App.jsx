import { useEffect, useState } from "react";

import "./App.css";
import { createSurvey, deleteSurvey, fetchSurveys, updateSurvey } from "./api/client";
import SurveyForm from "./components/SurveyForm";
import SurveyList from "./components/SurveyList";

function App() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    loadSurveys();
  }, []);

  const loadSurveys = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSurveys();
      setSurveys(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData) => {
    setSaving(true);
    setError(null);
    setStatusMessage(null);
    try {
      if (selectedSurvey) {
        const updatedSurvey = await updateSurvey(selectedSurvey.id, formData);
        setSurveys((prev) =>
          prev.map((survey) => (survey.id === updatedSurvey.id ? updatedSurvey : survey)),
        );
        setStatusMessage("Survey updated successfully.");
        setSelectedSurvey(null);
      } else {
        const createdSurvey = await createSurvey(formData);
        setSurveys((prev) => [createdSurvey, ...prev]);
        setStatusMessage("Survey submitted successfully.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (survey) => {
    setSelectedSurvey(survey);
    setStatusMessage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (survey) => {
    const confirmed = window.confirm(
      `Delete survey for ${survey.first_name} ${survey.last_name}?`,
    );
    if (!confirmed) return;

    setError(null);
    setStatusMessage(null);
    try {
      await deleteSurvey(survey.id);
      setSurveys((prev) => prev.filter((item) => item.id !== survey.id));
      setStatusMessage("Survey deleted.");
      if (selectedSurvey?.id === survey.id) {
        setSelectedSurvey(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancel = () => {
    setSelectedSurvey(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>GMU Student Survey</h1>
        <p>Collect insightful feedback from prospective students.</p>
      </header>

      {error && <div className="error-message">{error}</div>}
      {statusMessage && <div className="success-message">{statusMessage}</div>}

      <SurveyForm
        initialData={selectedSurvey}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        submitting={saving}
      />

      <SurveyList surveys={surveys} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
    </div>
  );
}

export default App;
