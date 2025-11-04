import {
  interestSourceOptions,
  likedMostOptions,
  recommendationOptions,
} from "../constants/options";

const likedMostLabels = Object.fromEntries(likedMostOptions.map((item) => [item.value, item.label]));
const recommendationLabels = Object.fromEntries(
  recommendationOptions.map((item) => [item.value, item.label]),
);
const interestSourceLabels = Object.fromEntries(
  interestSourceOptions.map((item) => [item.value, item.label]),
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
  return (
    <section className="panel">
      <div className="header-row">
        <h2>Submitted Surveys</h2>
      </div>
      {loading ? (
        <div className="empty-state">Loading surveys…</div>
      ) : surveys.length === 0 ? (
        <div className="empty-state">No surveys have been recorded yet.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="survey-table">
            <thead>
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
                  <td>{interestSourceLabels[survey.interest_source] ?? survey.interest_source}</td>
                  <td>{recommendationLabels[survey.recommendation_likelihood] ?? "—"}</td>
                  <td>
                    <div className="table-actions">
                      <button className="secondary" type="button" onClick={() => onEdit(survey)}>
                        Edit
                      </button>
                      <button
                        className="destructive"
                        type="button"
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
