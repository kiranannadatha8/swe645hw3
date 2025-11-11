import { useEffect, useMemo, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  interestSourceOptions,
  likedMostOptions,
  recommendationOptions,
} from "../constants/options";

const emptyForm = {
  first_name: "",
  last_name: "",
  street_address: "",
  city: "",
  state: "",
  zip_code: "",
  phone: "",
  email: "",
  date_of_survey: "",
  liked_most: [],
  interest_source: "friends",
  recommendation_likelihood: "very_likely",
  additional_comments: "",
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const zipRegex = /^\d{5}(-\d{4})?$/;
const phoneRegex = /^[0-9()+\-\s]{7,20}$/;

export default function SurveyForm({
  initialData,
  onSubmit,
  onCancel,
  submitting,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...emptyForm,
        ...initialData,
        date_of_survey: initialData.date_of_survey?.slice(0, 10) ?? "",
        liked_most: initialData.liked_most ?? [],
        additional_comments: initialData.additional_comments ?? "",
      });
    } else {
      setFormData(emptyForm);
    }
    setErrors({});
  }, [initialData]);

  const title = useMemo(
    () => (initialData ? "Update Student Survey" : "New Student Survey"),
    [initialData]
  );

  const handleTextChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (event) => {
    const { value, checked } = event.target;
    setFormData((prev) => {
      const current = new Set(prev.liked_most);
      if (checked) {
        current.add(value);
      } else {
        current.delete(value);
      }
      return { ...prev, liked_most: Array.from(current) };
    });
  };

  const validate = () => {
    const nextErrors = {};
    const requiredFields = [
      "first_name",
      "last_name",
      "street_address",
      "city",
      "state",
      "zip_code",
      "phone",
      "email",
      "date_of_survey",
    ];
    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        nextErrors[field] = "Required";
      }
    });

    if (formData.email && !emailRegex.test(formData.email)) {
      nextErrors.email = "Enter a valid email address";
    }

    if (formData.zip_code && !zipRegex.test(formData.zip_code)) {
      nextErrors.zip_code = "Use 5 digits or ZIP+4 format";
    }

    if (formData.phone && !phoneRegex.test(formData.phone)) {
      nextErrors.phone = "Enter a valid phone number";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      state: formData.state.toUpperCase(),
      liked_most: [...formData.liked_most],
      additional_comments: formData.additional_comments?.trim() || null,
    };

    onSubmit(payload);
  };

  const handleCancel = () => {
    setFormData(emptyForm);
    setErrors({});
    onCancel?.();
  };

  const gmuGreen = "#006633";
  const gmuYellow = "#FFCC33";

  return (
    <section className="container my-5">
      <h2 className="mb-4" style={{ color: gmuGreen }}>
        {title}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="row g-3">
          <div className="col-md-6 mb-2">
            <label
              htmlFor="first_name"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              First Name *
            </label>
            <input
              id="first_name"
              name="first_name"
              className={`form-control ${
                errors.first_name ? "is-invalid" : ""
              }`}
              value={formData.first_name}
              onChange={handleTextChange}
              placeholder="John"
            />
            {errors.first_name && (
              <div className="invalid-feedback">{errors.first_name}</div>
            )}
          </div>
          <div className="col-md-6 mb-2">
            <label
              htmlFor="last_name"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              Last Name *
            </label>
            <input
              id="last_name"
              name="last_name"
              className={`form-control ${errors.last_name ? "is-invalid" : ""}`}
              value={formData.last_name}
              onChange={handleTextChange}
              placeholder="Doe"
            />
            {errors.last_name && (
              <div className="invalid-feedback">{errors.last_name}</div>
            )}
          </div>

          <div className="col-12 mb-2">
            <label
              htmlFor="street_address"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              Street Address *
            </label>
            <input
              id="street_address"
              name="street_address"
              className={`form-control ${
                errors.street_address ? "is-invalid" : ""
              }`}
              value={formData.street_address}
              onChange={handleTextChange}
              placeholder="4400 University Dr"
            />
            {errors.street_address && (
              <div className="invalid-feedback">{errors.street_address}</div>
            )}
          </div>

          <div className="col-md-4 mb-2">
            <label
              htmlFor="city"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              City *
            </label>
            <input
              id="city"
              name="city"
              className={`form-control ${errors.city ? "is-invalid" : ""}`}
              value={formData.city}
              onChange={handleTextChange}
              placeholder="Fairfax"
            />
            {errors.city && (
              <div className="invalid-feedback">{errors.city}</div>
            )}
          </div>
          <div className="col-md-4 mb-2">
            <label
              htmlFor="state"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              State *
            </label>
            <input
              id="state"
              name="state"
              className={`form-control ${errors.state ? "is-invalid" : ""}`}
              value={formData.state}
              onChange={handleTextChange}
              placeholder="VA"
              maxLength={2}
            />
            {errors.state && (
              <div className="invalid-feedback">{errors.state}</div>
            )}
          </div>
          <div className="col-md-4 mb-2">
            <label
              htmlFor="zip_code"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              Zip Code *
            </label>
            <input
              id="zip_code"
              name="zip_code"
              className={`form-control ${errors.zip_code ? "is-invalid" : ""}`}
              value={formData.zip_code}
              onChange={handleTextChange}
              placeholder="22030"
            />
            {errors.zip_code && (
              <div className="invalid-feedback">{errors.zip_code}</div>
            )}
          </div>

          <div className="col-md-6 mb-2">
            <label
              htmlFor="phone"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              Telephone *
            </label>
            <input
              id="phone"
              name="phone"
              className={`form-control ${errors.phone ? "is-invalid" : ""}`}
              value={formData.phone}
              onChange={handleTextChange}
              placeholder="(703) 993-1000"
            />
            {errors.phone && (
              <div className="invalid-feedback">{errors.phone}</div>
            )}
          </div>
          <div className="col-md-6 mb-2">
            <label
              htmlFor="email"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              Email *
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className={`form-control ${errors.email ? "is-invalid" : ""}`}
              value={formData.email}
              onChange={handleTextChange}
              placeholder="student@gmu.edu"
            />
            {errors.email && (
              <div className="invalid-feedback">{errors.email}</div>
            )}
          </div>

          <div className="col-md-6 mb-2">
            <label
              htmlFor="date_of_survey"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              Date of Survey *
            </label>
            <input
              id="date_of_survey"
              name="date_of_survey"
              type="date"
              className={`form-control ${
                errors.date_of_survey ? "is-invalid" : ""
              }`}
              value={formData.date_of_survey}
              onChange={handleTextChange}
            />
            {errors.date_of_survey && (
              <div className="invalid-feedback">{errors.date_of_survey}</div>
            )}
          </div>

          <div className="col-12 mb-2">
            <label className="form-label" style={{ color: gmuGreen }}>
              What did you like most? *
            </label>
            <div className="d-flex flex-wrap gap-3">
              {likedMostOptions.map((option) => (
                <div className="form-check" key={option.value}>
                  <input
                    type="checkbox"
                    id={`liked_most_${option.value}`}
                    className="form-check-input"
                    value={option.value}
                    checked={formData.liked_most.includes(option.value)}
                    onChange={handleCheckboxChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`liked_most_${option.value}`}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-6 mb-2">
            <label
              htmlFor="interest_source"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              How did you become interested? *
            </label>
            <select
              id="interest_source"
              name="interest_source"
              className="form-select"
              value={formData.interest_source}
              onChange={handleTextChange}
            >
              {interestSourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="col-12 mt-3 mb-2">
            <label className="form-label" style={{ color: gmuGreen }}>
              Would you recommend GMU? *
            </label>
            <div className="d-flex flex-wrap gap-3">
              {recommendationOptions.map((option) => (
                <div className="form-check" key={option.value}>
                  <input
                    type="radio"
                    id={`recommend_${option.value}`}
                    name="recommendation_likelihood"
                    className="form-check-input"
                    value={option.value}
                    checked={
                      formData.recommendation_likelihood === option.value
                    }
                    onChange={handleTextChange}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`recommend_${option.value}`}
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="col-12 mb-2">
            <label
              htmlFor="additional_comments"
              className="form-label"
              style={{ color: gmuGreen }}
            >
              Additional Comments
            </label>
            <textarea
              id="additional_comments"
              name="additional_comments"
              className="form-control"
              value={formData.additional_comments}
              onChange={handleTextChange}
              placeholder="Share any other feedback about your campus visit."
              rows={3}
            />
          </div>
        </div>

        <div className="mt-4 d-flex gap-2">
          <button
            type="submit"
            className="btn"
            style={{ backgroundColor: gmuGreen, color: "#fff" }}
            disabled={submitting}
          >
            {submitting
              ? "Saving..."
              : initialData
              ? "Update Survey"
              : "Submit Survey"}
          </button>
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: gmuYellow, color: gmuGreen }}
            onClick={handleCancel}
            disabled={submitting}
          >
            {initialData ? "Cancel" : "Reset"}
          </button>
        </div>
      </form>
    </section>
  );
}
