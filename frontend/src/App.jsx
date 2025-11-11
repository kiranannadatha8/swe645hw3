import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  createSurvey,
  deleteSurvey,
  fetchSurveys,
  updateSurvey,
} from "./api/client";
import SurveyForm from "./components/SurveyForm";
import SurveyList from "./components/SurveyList";

function App() {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [error, setError] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);

  const gmuGreen = "#006633";
  const gmuYellow = "#FFCC33";

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
          prev.map((survey) =>
            survey.id === updatedSurvey.id ? updatedSurvey : survey
          )
        );
        setStatusMessage("✅ Survey updated successfully!");
        setSelectedSurvey(null);
      } else {
        const createdSurvey = await createSurvey(formData);
        setSurveys((prev) => [createdSurvey, ...prev]);
        setStatusMessage("✅ Survey submitted successfully!");
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
      `Delete survey for ${survey.first_name} ${survey.last_name}?`
    );
    if (!confirmed) return;

    setError(null);
    setStatusMessage(null);
    try {
      await deleteSurvey(survey.id);
      setSurveys((prev) => prev.filter((item) => item.id !== survey.id));
      setStatusMessage("🗑️ Survey deleted.");
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
    <div
      className="container py-5"
      style={{
        backgroundColor: "#f8f9fb",
        minHeight: "100vh",
        borderRadius: "16px",
        padding: "2.5rem 1.5rem 4rem",
      }}
    >
      <header className="text-center mb-5">
        <h1 className="fw-bold" style={{ color: "#134E4A" }}>
          GMU Student Survey
        </h1>
        <p style={{ color: "#4b5563" }}>
          Share your insights to help improve the GMU student experience!
        </p>
      </header>

      {error && (
        <div
          className="alert text-center"
          style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}
        >
          {error}
        </div>
      )}
      {statusMessage && (
        <div
          className="alert text-center"
          style={{ backgroundColor: "#dcfce7", color: "#006633" }}
        >
          {statusMessage}
        </div>
      )}

      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm p-4 border-0 rounded-4">
            <SurveyForm
              initialData={selectedSurvey}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitting={saving}
            />
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm p-4 border-0 rounded-4">
            <SurveyList
              surveys={surveys}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
