import "bootstrap/dist/css/bootstrap.min.css";
import {
  interestSourceOptions,
  likedMostOptions,
  recommendationOptions,
} from "../constants/options";

const likedMostLabels = Object.fromEntries(
  likedMostOptions.map((item) => [item.value, item.label])
);
const recommendationLabels = Object.fromEntries(
  recommendationOptions.map((item) => [item.value, item.label])
);
const interestSourceLabels = Object.fromEntries(
  interestSourceOptions.map((item) => [item.value, item.label])
);

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatLikedMost(values = []) {
  if (!values.length) return "—";
  return values.map((value) => likedMostLabels[value] ?? value).join(", ");
}

export default function SurveyList({ surveys, loading, onEdit, onDelete }) {
  const gmuGreen = "#006633";
  const gmuLightGray = "#FFCC33";

  return (
    <section className="container my-5">
      <div className="mb-3">
        <h2 style={{ color: gmuGreen }}>Submitted Surveys</h2>
      </div>

      {loading ? (
        <div className="text-center py-5" style={{ color: gmuGreen }}>
          Loading surveys…
        </div>
      ) : surveys.length === 0 ? (
        <div className="text-center py-5" style={{ color: gmuGreen }}>
          No surveys have been recorded yet.
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle">
            <thead style={{ backgroundColor: gmuGreen, color: "#fff" }}>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Survey Date</th>
                <th>Liked Most</th>
                <th>Interest Source</th>
                <th>Recommendation</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {surveys.map((survey) => (
                <tr key={survey.id}>
                  <td>
                    <strong>
                      {survey.first_name} {survey.last_name}
                    </strong>
                    <div>{survey.street_address}</div>
                    <div>
                      {survey.city}, {survey.state} {survey.zip_code}
                    </div>
                  </td>
                  <td>
                    <div>{survey.email}</div>
                    <div>{survey.phone}</div>
                  </td>
                  <td>{formatDate(survey.date_of_survey)}</td>
                  <td>{formatLikedMost(survey.liked_most)}</td>
                  <td>
                    {interestSourceLabels[survey.interest_source] ??
                      survey.interest_source}
                  </td>
                  <td>
                    {recommendationLabels[survey.recommendation_likelihood] ??
                      "—"}
                  </td>
                  <td>
                    <div className="d-flex flex-column gap-2">
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{ backgroundColor: gmuGreen, color: "#fff" }}
                        onClick={() => onEdit(survey)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm"
                        style={{
                          backgroundColor: gmuLightGray,
                          color: gmuGreen,
                        }}
                        onClick={() => onDelete(survey)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
