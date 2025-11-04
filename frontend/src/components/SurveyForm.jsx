import { useEffect, useMemo, useState } from "react";

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

export default function SurveyForm({ initialData, onSubmit, onCancel, submitting }) {
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
    [initialData],
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

  return (
    <section className="panel">
      <h2>{title}</h2>
      <form onSubmit={handleSubmit} className="survey-form">
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="first_name">First Name *</label>
            <input
              id="first_name"
              name="first_name"
              value={formData.first_name}
              onChange={handleTextChange}
              placeholder="John"
            />
            {errors.first_name && <span className="error">{errors.first_name}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="last_name">Last Name *</label>
            <input
              id="last_name"
              name="last_name"
              value={formData.last_name}
              onChange={handleTextChange}
              placeholder="Doe"
            />
            {errors.last_name && <span className="error">{errors.last_name}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="street_address">Street Address *</label>
            <input
              id="street_address"
              name="street_address"
              value={formData.street_address}
              onChange={handleTextChange}
              placeholder="4400 University Dr"
            />
            {errors.street_address && <span className="error">{errors.street_address}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="city">City *</label>
            <input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleTextChange}
              placeholder="Fairfax"
            />
            {errors.city && <span className="error">{errors.city}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="state">State *</label>
            <input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleTextChange}
              placeholder="VA"
              maxLength={2}
            />
            {errors.state && <span className="error">{errors.state}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="zip_code">Zip Code *</label>
            <input
              id="zip_code"
              name="zip_code"
              value={formData.zip_code}
              onChange={handleTextChange}
              placeholder="22030"
            />
            {errors.zip_code && <span className="error">{errors.zip_code}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="phone">Telephone *</label>
            <input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleTextChange}
              placeholder="(703) 993-1000"
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleTextChange}
              placeholder="student@gmu.edu"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="date_of_survey">Date of Survey *</label>
            <input
              id="date_of_survey"
              name="date_of_survey"
              type="date"
              value={formData.date_of_survey}
              onChange={handleTextChange}
            />
            {errors.date_of_survey && (
              <span className="error">{errors.date_of_survey}</span>
            )}
          </div>

          <div className="form-field">
            <label>What did you like most? *</label>
            <div className="checkbox-group">
              {likedMostOptions.map((option) => (
                <label className="checkbox-option" key={option.value}>
                  <input
                    type="checkbox"
                    value={option.value}
                    checked={formData.liked_most.includes(option.value)}
                    onChange={handleCheckboxChange}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="interest_source">How did you become interested? *</label>
            <select
              id="interest_source"
              name="interest_source"
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

          <div className="form-field">
            <label>Would you recommend GMU? *</label>
            <div className="radio-group">
              {recommendationOptions.map((option) => (
                <label className="radio-option" key={option.value}>
                  <input
                    type="radio"
                    name="recommendation_likelihood"
                    value={option.value}
                    checked={formData.recommendation_likelihood === option.value}
                    onChange={handleTextChange}
                  />
                  {option.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-field" style={{ gridColumn: "1 / -1" }}>
            <label htmlFor="additional_comments">Additional Comments</label>
            <textarea
              id="additional_comments"
              name="additional_comments"
              value={formData.additional_comments}
              onChange={handleTextChange}
              placeholder="Share any other feedback about your campus visit."
            />
          </div>
        </div>

        <div className="form-actions">
          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : initialData ? "Update Survey" : "Submit Survey"}
          </button>
          <button
            className="secondary"
            type="button"
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

